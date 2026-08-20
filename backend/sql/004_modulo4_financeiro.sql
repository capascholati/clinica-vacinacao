-- ============================================================
-- MÓDULO 4 — FINANCEIRO / CAIXA
-- Depende de: 001 (usuarios), 002 (fornecedores), 003 (clientes, agendamentos)
-- ============================================================

CREATE TABLE contas_receber (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id     UUID NOT NULL REFERENCES clientes(id),
  agendamento_id UUID REFERENCES agendamentos(id),
  descricao      TEXT NOT NULL,
  valor          NUMERIC(10,2) NOT NULL,
  vencimento     DATE,
  data_pagamento DATE,
  forma_pagamento TEXT CHECK (forma_pagamento IN ('dinheiro', 'pix', 'cartao_maquininha', 'cartao_link')),
  status         TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'parcial', 'cancelado', 'em_atraso')),
  criado_em      TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_contas_receber_cliente ON contas_receber (cliente_id);
CREATE INDEX idx_contas_receber_status ON contas_receber (status);

CREATE TABLE contas_pagar (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fornecedor_id  UUID REFERENCES fornecedores(id),
  descricao      TEXT NOT NULL,
  categoria      TEXT,
  valor          NUMERIC(10,2) NOT NULL,
  vencimento     DATE,
  data_pagamento DATE,
  status         TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'cancelado', 'em_atraso')),
  criado_em      TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_contas_pagar_status ON contas_pagar (status);

-- Um caixa por dia. Abrir/fechar é uma ação humana (recepção).
CREATE TABLE caixa_diario (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data           DATE NOT NULL UNIQUE,
  saldo_inicial  NUMERIC(10,2) NOT NULL DEFAULT 0,
  saldo_final    NUMERIC(10,2),
  status         TEXT NOT NULL DEFAULT 'aberto' CHECK (status IN ('aberto', 'fechado')),
  aberto_em      TIMESTAMPTZ NOT NULL DEFAULT now(),
  aberto_por_id  UUID REFERENCES usuarios(id),
  fechado_em     TIMESTAMPTZ,
  fechado_por_id UUID REFERENCES usuarios(id)
);

CREATE TABLE movimentacoes_caixa (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caixa_id       UUID NOT NULL REFERENCES caixa_diario(id),
  tipo           TEXT NOT NULL CHECK (tipo IN ('entrada', 'saida')),
  valor          NUMERIC(10,2) NOT NULL,
  forma_pagamento TEXT CHECK (forma_pagamento IN ('dinheiro', 'pix', 'cartao_maquininha', 'cartao_link')),
  descricao      TEXT,
  origem_tipo    TEXT, -- 'conta_receber', 'conta_pagar', 'avulso'
  origem_id      UUID,
  usuario_id     UUID REFERENCES usuarios(id),
  criado_em      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_movimentacoes_caixa_caixa ON movimentacoes_caixa (caixa_id);
