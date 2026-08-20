-- ============================================================
-- MÓDULO 2 — ESTOQUE & LOTES
-- Depende de: 001_modulo1_auth.sql (tabela usuarios, para FK de
-- responsável pelas movimentações)
-- ============================================================

CREATE TABLE fabricantes (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome      TEXT NOT NULL UNIQUE,
  ativo     BOOLEAN NOT NULL DEFAULT true,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE fornecedores (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome      TEXT NOT NULL,
  contato   TEXT,
  telefone  TEXT,
  email     TEXT,
  ativo     BOOLEAN NOT NULL DEFAULT true,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE vacinas (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome                    TEXT NOT NULL,
  fabricante_id           UUID REFERENCES fabricantes(id),
  apresentacao            TEXT,
  codigo_interno          TEXT UNIQUE,
  categoria               TEXT,
  temperatura_conservacao TEXT,
  estoque_minimo          NUMERIC(10,2) NOT NULL DEFAULT 0,
  estoque_ideal           NUMERIC(10,2) NOT NULL DEFAULT 0,
  estoque_maximo          NUMERIC(10,2),
  permite_estoque_negativo BOOLEAN NOT NULL DEFAULT false,
  ativo                   BOOLEAN NOT NULL DEFAULT true,
  criado_em               TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE insumos (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome                     TEXT NOT NULL,
  categoria                TEXT,
  unidade_medida           TEXT NOT NULL DEFAULT 'un',
  estoque_minimo           NUMERIC(10,2) NOT NULL DEFAULT 0,
  estoque_ideal            NUMERIC(10,2) NOT NULL DEFAULT 0,
  estoque_maximo           NUMERIC(10,2),
  permite_estoque_negativo BOOLEAN NOT NULL DEFAULT false,
  ativo                    BOOLEAN NOT NULL DEFAULT true,
  criado_em                TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em            TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela genérica de lote, compartilhada entre vacina e insumo
-- (decisão registrada: insumos também têm controle de lote/validade).
CREATE TABLE lotes (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  produto_tipo        TEXT NOT NULL CHECK (produto_tipo IN ('vacina', 'insumo')),
  produto_id          UUID NOT NULL, -- referencia vacinas.id OU insumos.id, checado em app (FK polimórfica)
  numero_lote         TEXT NOT NULL,
  validade             DATE NOT NULL,
  quantidade_fisica    NUMERIC(10,2) NOT NULL DEFAULT 0,
  quantidade_reservada NUMERIC(10,2) NOT NULL DEFAULT 0,
  custo_aquisicao      NUMERIC(10,2),
  preco_venda          NUMERIC(10,2),
  fornecedor_id        UUID REFERENCES fornecedores(id),
  localizacao_fisica   TEXT,
  bloqueado            BOOLEAN NOT NULL DEFAULT false,
  motivo_bloqueio      TEXT,
  status               TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'esgotado', 'vencido', 'inativo')),
  criado_em            TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em        TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_quantidade_reservada_nao_maior CHECK (quantidade_reservada <= quantidade_fisica OR quantidade_fisica < 0)
);

CREATE INDEX idx_lotes_produto_validade ON lotes (produto_tipo, produto_id, validade);
CREATE UNIQUE INDEX idx_lotes_numero_por_produto ON lotes (produto_tipo, produto_id, numero_lote);

-- Histórico imutável de movimentação — nunca editado, apenas inserido.
CREATE TABLE movimentacoes_estoque (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lote_id      UUID NOT NULL REFERENCES lotes(id),
  tipo         TEXT NOT NULL CHECK (tipo IN ('entrada', 'saida', 'ajuste', 'reserva', 'liberacao_reserva', 'estorno', 'bloqueio', 'desbloqueio')),
  quantidade   NUMERIC(10,2) NOT NULL,
  origem_tipo  TEXT, -- ex: 'compra', 'aplicacao', 'ajuste_manual', 'agendamento'
  origem_id    TEXT,
  observacao   TEXT,
  usuario_id   UUID REFERENCES usuarios(id),
  criado_em    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_movimentacoes_lote ON movimentacoes_estoque (lote_id, criado_em);
