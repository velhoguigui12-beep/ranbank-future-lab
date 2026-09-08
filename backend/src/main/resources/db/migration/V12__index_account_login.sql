ALTER TABLE bank_accounts ADD COLUMN account_number_normalized VARCHAR(255);
UPDATE bank_accounts SET account_number_normalized = REPLACE(REPLACE(account_number, '-', ''), ' ', '');
CREATE INDEX idx_bank_accounts_number_normalized ON bank_accounts(account_number_normalized);
