ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS role VARCHAR(32) DEFAULT 'CUSTOMER' NOT NULL;
UPDATE bank_accounts SET role = 'ADMIN' WHERE id = 1;

CREATE TABLE flow_executions (
    id VARCHAR(36) PRIMARY KEY,
    account_id BIGINT NOT NULL,
    flow_type VARCHAR(64) NOT NULL,
    trigger_type VARCHAR(64) NOT NULL,
    reference_id VARCHAR(64),
    status VARCHAR(64) NOT NULL,
    steps_json VARCHAR(4000) NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE
);
CREATE INDEX idx_flow_executions_account ON flow_executions(account_id, started_at);
CREATE INDEX idx_flow_executions_reference ON flow_executions(reference_id);
