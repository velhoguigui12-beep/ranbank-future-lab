ALTER TABLE bank_transactions ADD COLUMN IF NOT EXISTS account_id BIGINT;
ALTER TABLE connected_devices ADD COLUMN IF NOT EXISTS account_id BIGINT;

UPDATE bank_transactions SET account_id = 1 WHERE account_id IS NULL;
UPDATE connected_devices SET account_id = 1 WHERE account_id IS NULL;

ALTER TABLE bank_transactions ALTER COLUMN account_id SET NOT NULL;
ALTER TABLE connected_devices ALTER COLUMN account_id SET NOT NULL;

CREATE INDEX idx_bank_transactions_account ON bank_transactions(account_id);
CREATE INDEX idx_connected_devices_account ON connected_devices(account_id);
CREATE INDEX idx_scheduled_operation_account ON scheduled_operation(account_id);
