-- ============================================================
-- MÓDULO 1 — AUTENTICAÇÃO & PERFIS
-- Schema SQL puro, equivalente ao prisma/schema.prisma.
-- Usado quando o ambiente não tem acesso à engine binária do
-- Prisma (ex.: redes corporativas com whitelist restrita).
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto; -- gen_random_uuid()

CREATE TABLE perfis (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome          TEXT NOT NULL UNIQUE,
  descricao     TEXT,
  sistema       BOOLEAN NOT NULL DEFAULT false,
  ativo         BOOLEAN NOT NULL DEFAULT true,
  criado_em     TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE permissoes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chave       TEXT NOT NULL UNIQUE,
  modulo      TEXT NOT NULL,
  descricao   TEXT NOT NULL
);

CREATE TABLE perfil_permissoes (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  perfil_id         UUID NOT NULL REFERENCES perfis(id) ON DELETE CASCADE,
  permissao_id      UUID NOT NULL REFERENCES permissoes(id) ON DELETE CASCADE,
  concedida_em      TIMESTAMPTZ NOT NULL DEFAULT now(),
  concedida_por_id  UUID,
  UNIQUE (perfil_id, permissao_id)
);

CREATE TABLE usuarios (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome               TEXT NOT NULL,
  email              TEXT NOT NULL UNIQUE,
  senha_hash         TEXT NOT NULL,
  perfil_id          UUID NOT NULL REFERENCES perfis(id),
  ativo              BOOLEAN NOT NULL DEFAULT true,
  tentativas_falhas  INTEGER NOT NULL DEFAULT 0,
  bloqueado_ate      TIMESTAMPTZ,
  ultimo_login_em    TIMESTAMPTZ,
  criado_em          TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE refresh_tokens (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id   UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  token_hash   TEXT NOT NULL UNIQUE,
  criado_em    TIMESTAMPTZ NOT NULL DEFAULT now(),
  expira_em    TIMESTAMPTZ NOT NULL,
  revogado_em  TIMESTAMPTZ,
  user_agent   TEXT,
  ip           TEXT
);

CREATE TABLE password_reset_tokens (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id  UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  token_hash  TEXT NOT NULL UNIQUE,
  criado_em   TIMESTAMPTZ NOT NULL DEFAULT now(),
  expira_em   TIMESTAMPTZ NOT NULL,
  usado_em    TIMESTAMPTZ
);

CREATE TABLE logs_auditoria (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id     UUID REFERENCES usuarios(id),
  acao           TEXT NOT NULL,
  tabela_afetada TEXT,
  registro_id    TEXT,
  valor_anterior JSONB,
  valor_novo     JSONB,
  ip             TEXT,
  criado_em      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_logs_auditoria_tabela_registro ON logs_auditoria (tabela_afetada, registro_id);
CREATE INDEX idx_logs_auditoria_criado_em ON logs_auditoria (criado_em);
