-- ============================================================
-- MÓDULO 3 — CLIENTES & AGENDA
-- Depende de: 001 (usuarios), 002 (vacinas, lotes)
-- ============================================================

CREATE TABLE clientes (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_completo    TEXT NOT NULL,
  cpf              TEXT UNIQUE,
  data_nascimento  DATE,
  telefone         TEXT,
  whatsapp         TEXT,
  email            TEXT,
  endereco         TEXT,
  responsavel      TEXT, -- nome do responsável, quando aplicável (ex.: paciente menor de idade)
  observacoes      TEXT,
  ativo            BOOLEAN NOT NULL DEFAULT true,
  criado_em        TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_clientes_nome ON clientes (nome_completo);

-- Status conforme definido no diagnóstico (seção 7), com o acréscimo do
-- controle de reserva (que é rastreado por campos próprios, não por status,
-- para não confundir "situação do atendimento" com "situação do estoque").
CREATE TABLE agendamentos (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id               UUID NOT NULL REFERENCES clientes(id),
  vacina_id                UUID NOT NULL REFERENCES vacinas(id),
  profissional_id          UUID REFERENCES usuarios(id), -- pode ser definido depois do agendamento
  data                     DATE NOT NULL,
  horario                  TIME NOT NULL,
  status                   TEXT NOT NULL DEFAULT 'agendado' CHECK (status IN (
                              'agendado', 'confirmado', 'aguardando', 'em_atendimento',
                              'aplicado', 'cancelado', 'nao_compareceu', 'reagendar'
                            )),
  observacoes              TEXT,
  valor_previsto           NUMERIC(10,2),
  forma_pagamento_prevista TEXT CHECK (forma_pagamento_prevista IN ('dinheiro', 'pix', 'cartao_maquininha', 'cartao_link')),

  -- Reserva de estoque — sempre uma ação humana explícita (decisão registrada).
  lote_reservado_id        UUID REFERENCES lotes(id),
  quantidade_reservada     NUMERIC(10,2),
  reservado_em             TIMESTAMPTZ,
  reservado_por_id         UUID REFERENCES usuarios(id),

  criado_em                TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_agendamentos_data ON agendamentos (data, horario);
CREATE INDEX idx_agendamentos_cliente ON agendamentos (cliente_id);
CREATE INDEX idx_agendamentos_profissional ON agendamentos (profissional_id);
CREATE INDEX idx_agendamentos_status ON agendamentos (status);
