# STUDIO29 CORE — regras obrigatórias do Claude Code

Leia `docs/PROMPT_MESTRE.md`, `docs/HANDOVER.md`, `.claude/skills/studio29-core/SKILL.md` e o `worker.js` ANTES de alterar código.

## Fonte de verdade
- O `worker.js` fornecido é o último artefato local conhecido, com a correção do botão **Reenviar Email** posterior ao pacote MVP.
- **Não afirmar que é o código atualmente implantado** sem comparar com GitHub e Cloudflare.
- `COMERCIAL_HTML` = plataforma administrativa STUDIO29 CORE.
- `CELEBRA_VALIDACAO_HTML` = painel real do organizador (verificar roteamento no Worker).
- `CELEBRA_ORGANIZADOR_HTML` = interface distinta; não editar por engano.
- HTML é armazenado em constantes JS como strings JSON. Usar scripts de extração/alteração que preservem a sintaxe.

## Processo obrigatório
1. Inspecionar GitHub remoto e configuração Cloudflare existente (somente após autorização/conexão efetiva).
2. Criar branch; editar de forma pontual; não sobrescrever alterações remotas mais novas.
3. Executar verificações e testes; corrigir falhas antes de publicar.
4. Integrar via PR ou merge controlado à `main`.
5. GitHub Actions deve publicar automaticamente na Cloudflare após push/merge em `main`, somente se os checks passarem.
6. Validar a implantação por smoke test e registrar commit, URL, versão e resultado.
7. Se falhar: não publicar; se falhar após publicação, investigar e restaurar versão anterior segura.

## Segurança
- Não expor dados pessoais, tokens, senhas, credenciais, IDs privados ou dados D1/R2 em logs, commits e artefatos.
- Nunca apagar/recriar bancos D1/R2, nem executar migrações destrutivas sem plano e backup.
- Não criar credenciais ou IDs fictícios para publicação.
- Não prometer que uma publicação ocorreu sem evidência de execução e verificação.
- Priorizar cota gratuita e custo obrigatório R$ 0,00.
