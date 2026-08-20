ALTER TABLE bank_transactions
    ADD CONSTRAINT fk_bank_transactions_account
    FOREIGN KEY (account_id) REFERENCES bank_accounts(id);

ALTER TABLE connected_devices
    ADD CONSTRAINT fk_connected_devices_account
    FOREIGN KEY (account_id) REFERENCES bank_accounts(id);

ALTER TABLE scheduled_operation
    ADD CONSTRAINT fk_scheduled_operation_account
    FOREIGN KEY (account_id) REFERENCES bank_accounts(id);

ALTER TABLE bank_sessions
    ADD CONSTRAINT fk_bank_sessions_account
    FOREIGN KEY (account_id) REFERENCES bank_accounts(id) ON DELETE CASCADE;

ALTER TABLE pix_keys
    ADD CONSTRAINT fk_pix_keys_account
    FOREIGN KEY (account_id) REFERENCES bank_accounts(id) ON DELETE CASCADE;

ALTER TABLE pix_transfers
    ADD CONSTRAINT fk_pix_transfers_sender
    FOREIGN KEY (sender_account_id) REFERENCES bank_accounts(id);

ALTER TABLE pix_transfers
    ADD CONSTRAINT fk_pix_transfers_recipient
    FOREIGN KEY (recipient_account_id) REFERENCES bank_accounts(id);

ALTER TABLE notifications
    ADD CONSTRAINT fk_notifications_account
    FOREIGN KEY (account_id) REFERENCES bank_accounts(id) ON DELETE CASCADE;

ALTER TABLE audit_events
    ADD CONSTRAINT fk_audit_events_account
    FOREIGN KEY (account_id) REFERENCES bank_accounts(id) ON DELETE CASCADE;

ALTER TABLE flow_executions
    ADD CONSTRAINT fk_flow_executions_account
    FOREIGN KEY (account_id) REFERENCES bank_accounts(id) ON DELETE CASCADE;
