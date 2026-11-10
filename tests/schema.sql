-- Esquema de TESTE (estrutura copiada do D1 de produção; sem dados). Statements separados por linha em branco.
CREATE TABLE usuarios (id TEXT PRIMARY KEY, email TEXT NOT NULL COLLATE NOCASE UNIQUE, nome_completo TEXT NOT NULL, nome_preferido TEXT, telefone TEXT, senha_hash TEXT, provedor_identidade TEXT NOT NULL DEFAULT 'local' CHECK(provedor_identidade IN ('local','google','apple')), administrador_plataforma INTEGER NOT NULL DEFAULT 0 CHECK(administrador_plataforma IN (0,1)), ativo INTEGER NOT NULL DEFAULT 1 CHECK(ativo IN (0,1)), email_verificado_em TEXT, ultimo_acesso_em TEXT, criado_em TEXT NOT NULL, atualizado_em TEXT NOT NULL, troca_senha_obrigatoria INTEGER NOT NULL DEFAULT 0, bloqueado_em TEXT, bloqueado_ate TEXT, motivo_bloqueio TEXT, tentativas_login INTEGER NOT NULL DEFAULT 0, senha_alterada_em TEXT, bloqueado_por TEXT, desbloqueado_em TEXT);

CREATE TABLE sessoes_usuarios (id TEXT PRIMARY KEY, usuario_id TEXT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE, token_hash TEXT NOT NULL UNIQUE, criado_em TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')), expira_em TEXT NOT NULL, revogado_em TEXT, ultimo_uso_em TEXT);

CREATE TABLE tentativas_acesso (identificador TEXT PRIMARY KEY, quantidade INTEGER NOT NULL DEFAULT 0, janela_inicia_em TEXT NOT NULL, bloqueado_ate TEXT);

CREATE TABLE auditoria_acessos (id TEXT PRIMARY KEY, usuario_id TEXT REFERENCES usuarios(id), executado_por TEXT, acao TEXT NOT NULL, detalhes TEXT, criado_em TEXT NOT NULL);

CREATE TABLE clientes (id TEXT PRIMARY KEY NOT NULL, tipo_pessoa TEXT NOT NULL DEFAULT 'PF' CHECK (tipo_pessoa IN ('PF','PJ')), nome_exibicao TEXT NOT NULL CHECK (length(trim(nome_exibicao)) BETWEEN 1 AND 200), nome_razao_social TEXT, documento TEXT, email_contato TEXT, telefone_contato TEXT, situacao TEXT NOT NULL DEFAULT 'ativo' CHECK (situacao IN ('ativo','inativo')), observacoes_internas TEXT, criado_em TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')), atualizado_em TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')));

CREATE TABLE produtos (id TEXT PRIMARY KEY, codigo TEXT NOT NULL UNIQUE, nome TEXT NOT NULL, descricao TEXT, status TEXT NOT NULL DEFAULT 'rascunho' CHECK(status IN ('rascunho','ativo','inativo')), preco_base_centavos INTEGER NOT NULL DEFAULT 0 CHECK(preco_base_centavos >= 0), moeda TEXT NOT NULL DEFAULT 'BRL', dias_padrao_pos_evento INTEGER NOT NULL DEFAULT 15 CHECK(dias_padrao_pos_evento >= 0), metadados TEXT NOT NULL DEFAULT '{}' CHECK(json_valid(metadados)), criado_em TEXT NOT NULL, atualizado_em TEXT NOT NULL);

CREATE TABLE contratacoes (id TEXT PRIMARY KEY, cliente_id TEXT NOT NULL REFERENCES clientes(id), produto_id TEXT NOT NULL REFERENCES produtos(id), status TEXT NOT NULL DEFAULT 'rascunho' CHECK(status IN ('rascunho','pendente','ativa','cancelada','expirada')), numero_contratacao TEXT NOT NULL UNIQUE, nome_produto_contratado TEXT NOT NULL, valor_contratado_centavos INTEGER NOT NULL CHECK(valor_contratado_centavos >= 0), moeda TEXT NOT NULL DEFAULT 'BRL', contratado_em TEXT, servico_inicia_em TEXT, servico_termina_em TEXT, snapshot_comercial TEXT NOT NULL DEFAULT '{}' CHECK(json_valid(snapshot_comercial)), observacoes TEXT, criado_em TEXT NOT NULL, atualizado_em TEXT NOT NULL);

CREATE TABLE eventos (id TEXT PRIMARY KEY, cliente_id TEXT NOT NULL REFERENCES clientes(id), contratacao_id TEXT NOT NULL REFERENCES contratacoes(id), nome TEXT NOT NULL, slug TEXT NOT NULL UNIQUE, status TEXT NOT NULL DEFAULT 'rascunho' CHECK(status IN ('rascunho','provisionado','publicado','encerrado','arquivado','cancelado')), evento_inicia_em TEXT, evento_termina_em TEXT, publicacao_inicia_em TEXT, publicacao_termina_em TEXT, fuso_horario TEXT NOT NULL DEFAULT 'America/Belem', nome_local TEXT, endereco_local TEXT, configuracoes TEXT NOT NULL DEFAULT '{}' CHECK(json_valid(configuracoes)), liberado_manualmente_em TEXT, liberado_manualmente_por TEXT REFERENCES usuarios(id), criado_em TEXT NOT NULL, atualizado_em TEXT NOT NULL);

CREATE TABLE celebra_convidados (id TEXT PRIMARY KEY NOT NULL, evento_id TEXT NOT NULL REFERENCES eventos(id) ON DELETE RESTRICT, nome TEXT NOT NULL CHECK(length(trim(nome)) BETWEEN 1 AND 200), token_hash TEXT NOT NULL UNIQUE, criado_em TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')));

CREATE TABLE celebra_confirmacoes (id TEXT PRIMARY KEY NOT NULL, evento_id TEXT NOT NULL REFERENCES eventos(id) ON DELETE RESTRICT, convidado_id TEXT REFERENCES celebra_convidados(id) ON DELETE SET NULL, nome TEXT NOT NULL, presenca TEXT NOT NULL CHECK(presenca IN ('sim','nao')), acompanhantes_json TEXT NOT NULL DEFAULT '[]', origem TEXT NOT NULL CHECK(origem IN ('geral','individual')), situacao TEXT NOT NULL DEFAULT 'pendente' CHECK(situacao IN ('pendente','revisar','confirmado','rejeitado')), mensagem TEXT, criado_em TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')), atualizado_em TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')));

CREATE TABLE celebra_idades_confirmacoes (confirmacao_id TEXT PRIMARY KEY NOT NULL, idade_titular INTEGER NOT NULL CHECK(idade_titular BETWEEN 0 AND 99));

CREATE TABLE celebra_emails_convidados (confirmacao_id TEXT PRIMARY KEY, evento_id TEXT NOT NULL, email TEXT NOT NULL, atualizado_em TEXT NOT NULL);

CREATE TABLE celebra_exclusoes_confirmacoes (id TEXT PRIMARY KEY NOT NULL, evento_id TEXT NOT NULL, confirmacao_id TEXT NOT NULL, nome TEXT NOT NULL, situacao_anterior TEXT NOT NULL, ator TEXT NOT NULL, criado_em TEXT NOT NULL);

CREATE TABLE celebra_envios_controle (evento_id TEXT NOT NULL, confirmacao_id TEXT NOT NULL, email_enviado INTEGER NOT NULL DEFAULT 0, whatsapp_enviado INTEGER NOT NULL DEFAULT 0, atualizado_em TEXT NOT NULL, PRIMARY KEY(evento_id,confirmacao_id));

CREATE TABLE celebra_notificacoes_config (evento_id TEXT PRIMARY KEY, emails_json TEXT NOT NULL DEFAULT '[]', whatsapp TEXT NOT NULL DEFAULT '', atualizado_em TEXT NOT NULL, email_ativo INTEGER NOT NULL DEFAULT 1, whatsapp_ativo INTEGER NOT NULL DEFAULT 1, assunto_presenca TEXT NOT NULL DEFAULT '', assunto_ausencia TEXT NOT NULL DEFAULT '');

CREATE TABLE celebra_notificacoes_envios (id TEXT PRIMARY KEY, evento_id TEXT NOT NULL, confirmacao_id TEXT NOT NULL, email_destino TEXT NOT NULL, situacao TEXT NOT NULL, erro TEXT, criado_em TEXT NOT NULL);

CREATE TABLE celebra_destinatarios_email (evento_id TEXT NOT NULL, email TEXT NOT NULL, PRIMARY KEY(evento_id,email));

CREATE TABLE celebra_links_individuais (evento_id TEXT NOT NULL, convidado_id TEXT NOT NULL, token_texto TEXT NOT NULL, atualizado_em TEXT NOT NULL, PRIMARY KEY(evento_id, convidado_id));

CREATE TABLE celebra_links_organizadores (evento_id TEXT PRIMARY KEY NOT NULL, token_texto TEXT NOT NULL, atualizado_em TEXT NOT NULL);

CREATE TABLE celebra_acessos_organizadores (evento_id TEXT PRIMARY KEY NOT NULL REFERENCES eventos(id) ON DELETE RESTRICT, token_hash TEXT NOT NULL UNIQUE, atualizado_em TEXT NOT NULL);

CREATE TABLE core_eventos_paginas (evento_id TEXT PRIMARY KEY, convite_ativo INTEGER NOT NULL DEFAULT 1, dias_pos_evento INTEGER NOT NULL DEFAULT 15, atualizado_em TEXT NOT NULL, idade_max_crianca INTEGER NOT NULL DEFAULT 12);

CREATE TABLE core_paginas (chave TEXT PRIMARY KEY, titulo TEXT NOT NULL DEFAULT '', favicon TEXT NOT NULL DEFAULT '', ativo INTEGER NOT NULL DEFAULT 1, atualizado_em TEXT NOT NULL);

CREATE TABLE core_favicons (chave TEXT PRIMARY KEY, mime TEXT NOT NULL, dados TEXT NOT NULL, atualizado_em TEXT NOT NULL);

CREATE TABLE integracoes_oauth (id TEXT PRIMARY KEY, provedor TEXT NOT NULL UNIQUE, conta_email TEXT, token_atualizacao_criptografado TEXT, escopos TEXT, autorizado_em TEXT, atualizado_em TEXT NOT NULL, ativo INTEGER NOT NULL DEFAULT 0);
