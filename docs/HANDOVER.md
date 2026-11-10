# STUDIO29 CORE — handover técnico do MVP

## Escopo
Plataforma administrativa STUDIO29 CORE e produto Celebra by STUDIO29, para criar e administrar eventos, convites digitais, participantes, acompanhantes, confirmações, validações e notificações. Painel do organizador com permissões por evento. Galeria de Memórias opcional e cobrada à parte. Modelo comercial por evento; hospedagem limitada após evento conforme configuração. Infraestrutura inicial prioriza cotas gratuitas.

## Fonte de código
`worker.js` neste pacote foi obtido da versão local `STUDIO29_CORE_CORRECAO_REENVIO_EMAIL`, posterior a `STUDIO29_CORE_SWITCH_COMPACTO_POSICIONADO`. Confirmar diff com repositório remoto e deploy antes de qualquer integração. **Não há garantia de equivalência com produção.**

## Constantes HTML
- `COMERCIAL_HTML`: interface administrativa.
- `CELEBRA_VALIDACAO_HTML`: painel real do organizador.
- `CELEBRA_ORGANIZADOR_HTML`: interface adicional.
- `CELEBRA_CONVITE_HTML`: convite digital.
As páginas são strings dentro do Worker, não arquivos HTML independentes de origem.

## Funcionalidades e regras
- STUDIO29 CORE é a única página administrativa não desabilitável; rota histórica `/comercial#dashboard`.
- Configuração de títulos, visibilidade de páginas, favicon, notificações por e-mail/WhatsApp e destinatários.
- Convidados: titular e acompanhantes; respostas por link geral podem exigir validação.
- Campos de acompanhantes podem usar `age` ou `idade`; classificação Adulto/Criança depende do limite por evento `idade_max_crianca`.
- `celebra_confirmacoes` e `celebra_notificacoes_envios` são tabelas relevantes; conferir esquema real no Worker/D1.
- Rotas de organizador conhecidas: `organizador-confirmacoes`, `organizador-validar`, `organizador-editar`, `organizador-participante-excluir`, `organizador-incluir-manual`; conferir método/caminho completo no código.
- Painel: Lista padrão, Quadro alternativo, interruptor compacto afeta apenas a tabela; detalhes, edição, exclusão e validação. Organizador sempre em modo escuro.
- Notificações: reenvio via Detalhes; deve informar carregamento, sucesso e erro; auditoria em D1. Versão local contém correção para passagem nula da referência do botão.

## Estado e limitações
MVP aceito como marco funcional pelo proprietário. Não há comprovação neste pacote de testes E2E completos, implantação da última correção, nem configuração CI/CD ativa. Antes de operar em produção, auditar segurança, integração, fluxos e registros reais.

## Deploy
O workflow fornecido é um modelo pronto para ativação após informar secrets Cloudflare e copiar os bindings/rotas reais para `wrangler.toml` (não incluído por segurança contra suposições). Auto-deploy após push na `main` com validação de sintaxe, smoke e verificação de URL. Não criar configurações D1/R2 fictícias.

## Auditoria e estado de produção (2026-11-10)
- Produção: Worker `studio29-core-teste`, D1 `studio29-core-teste` (binding `DB`), URL `https://studio29-core-teste.studio29core.workers.dev`. Só existe a URL workers.dev (sem domínio/rota própria); URLs de versão prévia desligadas.
- O `worker.js` v1.14.2 do repositório foi comparado com o código implantado: idêntico (ignorando espaços em branco).
- Eventos ficam na tabela `eventos`. As tabelas `celebra_eventos` e `celebra_organizadores` existem no D1, estão vazias e **não são usadas** pelo `worker.js` (resíduos de versões anteriores). Não apagar sem plano e backup.
- Reenviar Email: 5 falhas históricas, todas HTTP_400 em 2026-11-06, sem recorrência. Cobertura por testes.
- Segredos do Worker (não ficam no repositório): `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `OAUTH_ENCRYPTION_KEY`. Variável: `RECOVERY_EMAIL_ENABLED=true`.

## Recursos legados (mantidos, não alterar)
- Worker `studio29-core-api` e D1 `studio29-core` (v1.2.1): legados e separados de produção. Decisão: **manter e documentar**; nada foi apagado ou alterado. Qualquer desativação exige plano e backup prévios.
- `minhas-financas`: projeto independente; nunca tocar.

## Pipeline de deploy (ativo)
1. Branch → PR para `main`. O job `validate` (validate.mjs + `npm ci` + `npm test`) deve passar.
2. Merge na `main` → job `deploy` (environment `production`, só a partir da `main`): `wrangler deploy`, smoke test em `/saude` e registro do commit.
3. Se `validate` falhar, não há deploy. Se o deploy falhar, a produção permanece na versão anterior.
- GitHub: secrets `CLOUDFLARE_API_TOKEN` (permissões mínimas: Workers Scripts, D1, KV, Account Settings Read) e `CLOUDFLARE_ACCOUNT_ID`; variável `STUDIO29_SMOKE_URL`. O token pode ter expiração: renovar antes de vencer.
- Rollback: Cloudflare → Workers & Pages → `studio29-core-teste` → Deployments → reverter para a versão anterior.
- Primeiro deploy via pipeline: commit `6131d09`, smoke test aprovado, versão 1.14.2.

## Domínio próprio (preparado, desligado)
- O host padrão continua fixo. Para aceitar domínios adicionais, definir a variável `HOSTS_PERMITIDOS` (lista separada por vírgula) no Worker. Sem ela, o comportamento é idêntico ao anterior. O domínio também precisa ser configurado na Cloudflare; os links já divulgados continuam na URL workers.dev.

## Testes
- 18 testes (Miniflare + D1 local descartável), incluindo reenvio de e-mail, aprovação de confirmações pendentes pelo organizador e restrição de host. Rodam no CI antes de qualquer deploy.
