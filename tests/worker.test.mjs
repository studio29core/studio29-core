// Testes funcionais: executam o worker.js REAL contra um D1 local descartável (Miniflare).
// Nada aqui acessa produção, a rede externa ou dados reais.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { Miniflare } from 'miniflare';

const ORIGIN = 'https://studio29-core-teste.studio29core.workers.dev'; // o worker só aceita este host (worker.js:809)
const sha = s => crypto.createHash('sha256').update(s).digest('hex');
const ids = { adminTok: 'a'.repeat(64), userTok: 'b'.repeat(64) };
const U = { admin: crypto.randomUUID(), user: crypto.randomUUID() };
const EV = crypto.randomUUID(), CONF = crypto.randomUUID(), CONF_OFF = crypto.randomUUID();
const SLUG = 'evento-teste', SLUG_OFF = 'evento-sem-email';
let mf, db;

const run = (sql, ...b) => db.prepare(sql).bind(...b).run();
const cookie = t => ({ Cookie: 'studio29_sessao=' + t });
const post = (path, body, headers = {}) => mf.dispatchFetch(ORIGIN + path, {
  method: 'POST', body: JSON.stringify(body),
  headers: { 'Content-Type': 'application/json', Origin: ORIGIN, ...headers }
});

before(async () => {
  mf = new Miniflare({ modules: true, scriptPath: 'worker.js', compatibilityDate: '2026-08-06', d1Databases: { DB: 'teste' } });
  db = await mf.getD1Database('DB');
  const stmts = fs.readFileSync('tests/schema.sql', 'utf8').split(/\n\s*\n/).map(s => s.replace(/^--.*$/gm, '').trim()).filter(Boolean);
  for (const s of stmts) await db.prepare(s.replace(/\s+/g, ' ')).run();
  const t = new Date().toISOString(), exp = new Date(Date.now() + 3600e3).toISOString();
  for (const [id, adm] of [[U.admin, 1], [U.user, 0]])
    await run('INSERT INTO usuarios(id,email,nome_completo,administrador_plataforma,ativo,criado_em,atualizado_em) VALUES(?,?,?,?,1,?,?)', id, id + '@teste.local', 'Usuário ' + adm, adm, t, t);
  await run('INSERT INTO sessoes_usuarios(id,usuario_id,token_hash,expira_em) VALUES(?,?,?,?)', crypto.randomUUID(), U.admin, sha(ids.adminTok), exp);
  await run('INSERT INTO sessoes_usuarios(id,usuario_id,token_hash,expira_em) VALUES(?,?,?,?)', crypto.randomUUID(), U.user, sha(ids.userTok), exp);
  const cli = crypto.randomUUID(), prod = crypto.randomUUID(), con = crypto.randomUUID();
  await run("INSERT INTO clientes(id,nome_exibicao) VALUES(?,'Cliente Teste')", cli);
  await run("INSERT INTO produtos(id,codigo,nome,criado_em,atualizado_em) VALUES(?,'celebra','Celebra',?,?)", prod, t, t);
  await run("INSERT INTO contratacoes(id,cliente_id,produto_id,numero_contratacao,nome_produto_contratado,valor_contratado_centavos,criado_em,atualizado_em) VALUES(?,?,?,'T-1','Celebra',0,?,?)", con, cli, prod, t, t);
  for (const [id, slug] of [[EV, SLUG], [crypto.randomUUID(), SLUG_OFF]])
    await run("INSERT INTO eventos(id,cliente_id,contratacao_id,nome,slug,status,criado_em,atualizado_em) VALUES(?,?,?,?,?,'publicado',?,?)", id, cli, con, 'Evento ' + slug, slug, t, t);
  const evOff = (await db.prepare('SELECT id FROM eventos WHERE slug=?').bind(SLUG_OFF).first()).id;
  await run("INSERT INTO celebra_confirmacoes(id,evento_id,nome,presenca,origem,situacao) VALUES(?,?,'Fulano de Tal','sim','geral','pendente')", CONF, EV);
  await run("INSERT INTO celebra_confirmacoes(id,evento_id,nome,presenca,origem,situacao) VALUES(?,?,'Beltrano Sem Email','sim','geral','pendente')", CONF_OFF, evOff);
  await run("INSERT INTO celebra_notificacoes_config(evento_id,emails_json,atualizado_em,email_ativo) VALUES(?,?,?,1)", EV, '["organizador@teste.local"]', t);
  await run("INSERT INTO celebra_notificacoes_config(evento_id,emails_json,atualizado_em,email_ativo) VALUES(?,'[]',?,0)", evOff, t);
});
after(async () => { await mf?.dispose(); });

const reenviar = (slug, id, headers) => post(`/celebra/${slug}/api/reenviar-notificacao`, { id }, headers);

test('/saude responde operacional com banco conectado', async () => {
  const r = await mf.dispatchFetch(ORIGIN + '/saude');
  assert.equal(r.status, 200);
  const j = await r.json();
  assert.equal(j.estado, 'operacional'); assert.equal(j.banco, 'conectado'); assert.match(j.versao, /^\d+\.\d+\.\d+$/);
});

test('convite público carrega (HTML) para evento publicado', async () => {
  const r = await mf.dispatchFetch(`${ORIGIN}/celebra/${SLUG}/convite?c=GERAL`);
  assert.equal(r.status, 200);
  assert.match(r.headers.get('content-type'), /text\/html/);
});

test('evento inexistente devolve 404', async () => {
  const r = await mf.dispatchFetch(`${ORIGIN}/celebra/nao-existe/convite`);
  assert.equal(r.status, 404);
});

test('/comercial sem sessão redireciona ao login', async () => {
  const r = await mf.dispatchFetch(ORIGIN + '/comercial', { redirect: 'manual' });
  assert.equal(r.status, 302);
});

test('reenviar: sem sessão → 401', async () => {
  assert.equal((await reenviar(SLUG, CONF)).status, 401);
});

test('reenviar: usuário comum (não administrador) → 403', async () => {
  const r = await reenviar(SLUG, CONF, cookie(ids.userTok));
  assert.equal(r.status, 403); assert.equal((await r.json()).erro, 'ACESSO_NEGADO');
});

test('reenviar: Origin diferente → 403', async () => {
  const r = await reenviar(SLUG, CONF, { ...cookie(ids.adminTok), Origin: 'https://malicioso.example' });
  assert.equal(r.status, 403); assert.equal((await r.json()).erro, 'ORIGEM_INVALIDA');
});

test('reenviar: ID inválido → 400 e confirmação desconhecida → 404', async () => {
  assert.equal((await reenviar(SLUG, 'xyz', cookie(ids.adminTok))).status, 400);
  assert.equal((await reenviar(SLUG, crypto.randomUUID(), cookie(ids.adminTok))).status, 404);
});

test('reenviar: notificações desativadas/sem destinatário → 400 e nada é registrado', async () => {
  const r = await reenviar(SLUG_OFF, CONF_OFF, cookie(ids.adminTok));
  assert.equal(r.status, 400);
  const n = await db.prepare('SELECT COUNT(*) n FROM celebra_notificacoes_envios WHERE confirmacao_id=?').bind(CONF_OFF).first();
  assert.equal(n.n, 0);
});

test('reenviar: sem Gmail autorizado registra FALHA no D1 e responde sem vazar detalhes', async () => {
  const r = await reenviar(SLUG, CONF, cookie(ids.adminTok));
  assert.equal(r.status, 200);
  const j = await r.json();
  assert.equal(j.resultado, 'PROCESSADO'); assert.equal(j.tentativas, 1); assert.equal(j.enviados, 0); assert.equal(j.falhas, 1);
  const row = await db.prepare('SELECT situacao,erro,email_destino FROM celebra_notificacoes_envios WHERE confirmacao_id=?').bind(CONF).first();
  assert.equal(row.situacao, 'falhou'); assert.ok(row.erro && row.erro.length <= 120);
  assert.doesNotMatch(JSON.stringify(j), /token|secret|Bearer/i);
});

test('reenviar: cada chamada gera um novo registro de auditoria (sem sobrescrever)', async () => {
  await reenviar(SLUG, CONF, cookie(ids.adminTok));
  const n = await db.prepare('SELECT COUNT(*) n FROM celebra_notificacoes_envios WHERE confirmacao_id=?').bind(CONF).first();
  assert.equal(n.n, 2);
});
