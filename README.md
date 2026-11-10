# STUDIO29 CORE — pacote de continuidade para Claude Code

## Começar
1. Descompacte o ZIP e abra esta pasta no Claude Code.
2. Leia `CLAUDE.md` e `docs/PROMPT_MESTRE.md`; execute `node scripts/validate.mjs`.
3. Conecte o repositório GitHub oficial e Cloudflare na sua sessão, com credenciais sob seu controle.
4. **Antes de publicar**, compare o `worker.js` com a versão remota e obtenha o `wrangler.toml/jsonc` real. O `wrangler.example.toml` é apenas referência e NÃO está pronto para produção.
5. Configure os GitHub Secrets `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` e a variável de ambiente `STUDIO29_SMOKE_URL` (URL pública de uma página sem autenticação).
6. Envie o workflow `.github/workflows/cloudflare-deploy.yml` ao repositório e configure proteção da `main` para exigir o job `validate` em PRs (o workflow já valida PRs).
7. Após merge/push na `main`, o workflow testa, publica na Cloudflare e faz smoke test automaticamente. Não requer comando manual de publicação a cada alteração.

## Atenção
- A última versão local inclui a correção de reenvio de e-mail, mas NÃO foi comprovadamente publicada.
- `validate.mjs` verifica sintaxe e estrutura; não substitui testes E2E.
- A automação só fica ativa depois de configurar o repositório, secrets, wrangler e permissões.
- Smoke test básico verifica HTTP/HTML; acrescente testes de API autenticada e fluxos críticos antes de usar como critério de produção.
- Não inclua dumps D1/R2, tokens ou dados de convidados em commits.
