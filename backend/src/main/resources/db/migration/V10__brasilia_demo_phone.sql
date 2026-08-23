UPDATE bank_accounts
SET phone_number = '61988880202'
WHERE id = 2 AND phone_number = '11988880202';

UPDATE pix_keys
SET normalized_key = '61988880202', display_key = '(61) 98888-0202'
WHERE account_id = 2 AND key_type = 'PHONE' AND normalized_key = '11988880202';
