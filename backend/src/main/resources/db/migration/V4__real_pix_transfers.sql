ALTER TABLE bank_transactions ADD COLUMN IF NOT EXISTS transfer_id VARCHAR(36);
ALTER TABLE bank_transactions ADD COLUMN IF NOT EXISTS counterparty_account_id BIGINT;
ALTER TABLE bank_transactions ADD COLUMN IF NOT EXISTS occurred_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE bank_transactions ADD COLUMN IF NOT EXISTS status VARCHAR(32);
ALTER TABLE bank_transactions ADD COLUMN IF NOT EXISTS idempotency_key VARCHAR(64);

UPDATE bank_transactions SET occurred_at = CURRENT_TIMESTAMP WHERE occurred_at IS NULL;
UPDATE bank_transactions SET status = 'COMPLETED' WHERE status IS NULL;

CREATE UNIQUE INDEX uq_bank_transactions_idempotency
    ON bank_transactions(account_id, idempotency_key);
CREATE INDEX idx_bank_transactions_transfer ON bank_transactions(transfer_id);

CREATE TABLE pix_transfers (
    id VARCHAR(36) PRIMARY KEY,
    sender_account_id BIGINT NOT NULL,
    recipient_account_id BIGINT NOT NULL,
    pix_key VARCHAR(255) NOT NULL,
    amount DECIMAL(19,2) NOT NULL,
    idempotency_key VARCHAR(64) NOT NULL,
    status VARCHAR(32) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL
);
CREATE UNIQUE INDEX uq_pix_transfer_idempotency
    ON pix_transfers(sender_account_id, idempotency_key);
CREATE INDEX idx_pix_transfer_sender ON pix_transfers(sender_account_id);
CREATE INDEX idx_pix_transfer_recipient ON pix_transfers(recipient_account_id);
