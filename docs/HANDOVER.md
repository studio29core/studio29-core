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
