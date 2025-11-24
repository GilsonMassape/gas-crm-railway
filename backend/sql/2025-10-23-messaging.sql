-- clientes (se já tiver, pule; aqui está o mínimo necessário)
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  phone_e164 TEXT UNIQUE NOT NULL,          -- +5588999999999
  region TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- compras de gás/água (para prever reposição)
CREATE TABLE IF NOT EXISTS purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  product TEXT NOT NULL,                     -- "GAS_P13" | "AGUA_20L" | ...
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- templates de mensagens
CREATE TABLE IF NOT EXISTS message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  channel TEXT NOT NULL DEFAULT 'whatsapp',  -- 'whatsapp' | 'sms' | 'email'
  body TEXT NOT NULL,                         -- ex: "Olá {{firstName}}, seu gás costuma durar {{days}} dias..."
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- regras de lembrete (ex.: avisar 25 dias após última compra de P13)
CREATE TABLE IF NOT EXISTS reminder_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product TEXT NOT NULL,                      -- alvo da regra (GAS_P13 etc.)
  after_days INTEGER NOT NULL CHECK (after_days > 0),
  template_id UUID NOT NULL REFERENCES message_templates(id) ON DELETE RESTRICT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- fila persistida (auditoria dos envios)
CREATE TABLE IF NOT EXISTS message_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES message_templates(id) ON DELETE RESTRICT,
  channel TEXT NOT NULL,
  payload JSONB NOT NULL,                     -- dados de merge usados no body
  scheduled_for TIMESTAMPTZ NOT NULL,         -- quando deve ser enviado
  status TEXT NOT NULL DEFAULT 'pending',     -- pending|processing|sent|failed|canceled
  provider_msg_id TEXT,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- índices úteis
CREATE INDEX IF NOT EXISTS idx_purchases_customer_time ON purchases(customer_id, purchased_at DESC);
CREATE INDEX IF NOT EXISTS idx_message_queue_status_time ON message_queue(status, scheduled_for);
