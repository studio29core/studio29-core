// Smoke test pós-deploy: /saude deve responder JSON operacional com banco conectado.
const base = process.env.SMOKE_URL;
if (!base) { console.error('SMOKE_URL é obrigatório'); process.exit(1); }
const url = new URL('/saude', base);
const res = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(20000) });
if (!res.ok) { console.error('HTTP ' + res.status); process.exit(1); }
const data = await res.json().catch(() => null);
if (data?.estado !== 'operacional' || data?.banco !== 'conectado') {
  console.error('Saúde inesperada:', JSON.stringify(data)); process.exit(1);
}
const page = await fetch(new URL('/painel', base), { signal: AbortSignal.timeout(20000) });
if (page.status >= 500) { console.error('/painel HTTP ' + page.status); process.exit(1); }
console.log('Smoke OK:', url.origin, 'versão:', data.versao, 'commit:', process.env.GITHUB_SHA || 'n/d');
