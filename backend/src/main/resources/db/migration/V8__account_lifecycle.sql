ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE NOT NULL;
ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

UPDATE bank_accounts SET active = TRUE WHERE active IS NULL;

CREATE INDEX IF NOT EXISTS idx_bank_accounts_active ON bank_accounts(active);
