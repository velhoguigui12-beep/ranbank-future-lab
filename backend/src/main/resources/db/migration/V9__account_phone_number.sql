ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS phone_number VARCHAR(32);

CREATE UNIQUE INDEX IF NOT EXISTS uq_bank_accounts_phone ON bank_accounts(phone_number);
