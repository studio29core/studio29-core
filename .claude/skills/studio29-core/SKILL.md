---
name: studio29-core
description: Manter e evoluir o STUDIO29 CORE/Celebra com Cloudflare Workers, D1, UI embutida e deploy automático seguro.
---
# Skill — STUDIO29 CORE

## Ativação
Use quando a tarefa mencionar STUDIO29 CORE, Celebra, convites, organizador, D1, Worker, e-mail, Cloudflare ou publicação deste projeto.

## Procedimento
1. Ler `CLAUDE.md`, `docs/HANDOVER.md`, `docs/PROMPT_MESTRE.md` e inspecionar `worker.js`.
2. Inspecionar repositório remoto e estado do deploy; nunca sobrescrever mudanças remotas não incorporadas.
3. Mapear rota e constante HTML efetivamente utilizadas. `CELEBRA_VALIDACAO_HTML` é a página real do organizador, não `CELEBRA_ORGANIZADOR_HTML`.
4. Fazer menor alteração possível e preservar interface, regras e integrações.
5. Validar sintaxe Worker e scripts embutidos com `node scripts/validate.mjs`.
6. Executar testes adicionais pertinentes (API, UI, permissões, e-mail, mobile). Não confundir syntax check com teste de integração.
7. Criar PR e integrar somente com checks verdes.
8. Deploy automático GitHub Actions para Cloudflare na `main`; verificar URL e logs; se falhar, parar e informar.
9. Preservar D1/R2, segredos e custo zero obrigatório.

## Contratos e padrões
- UI azul-noite/dourado, responsiva, acessível; painel organizador sempre escuro.
- Interruptor Lista/Quadro compacto, padrão Lista, somente na tabela de participantes.
- Idade normalizada de `age`/`idade`; perfil definido pelo limite do evento.
- Todas as ações async com feedback de loading, sucesso e erro.
- Botão Reenviar Email deve chamar API e registrar status no D1, sem travar por referência de botão nula.
- Não presumir endpoints, campos, secrets ou banco sem conferir código/infra.

## Saída
Descrever alterações, testes realizados e seus resultados, PR/commit, deploy e URL verificada; se não implantado, dizer explicitamente.
