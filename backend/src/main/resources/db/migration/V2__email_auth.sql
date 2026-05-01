ALTER TABLE usuarios
    ADD COLUMN IF NOT EXISTS password_hash      VARCHAR(255),
    ADD COLUMN IF NOT EXISTS auth_provider      VARCHAR(10)  NOT NULL DEFAULT 'GOOGLE',
    ADD COLUMN IF NOT EXISTS email_verificado   BOOLEAN      NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS verification_token VARCHAR(36),
    ADD COLUMN IF NOT EXISTS verification_token_expiry TIMESTAMP,
    ADD COLUMN IF NOT EXISTS reset_password_token VARCHAR(36),
    ADD COLUMN IF NOT EXISTS reset_password_token_expiry TIMESTAMP;

-- Los usuarios de Google ya tienen email verificado
UPDATE usuarios SET email_verificado = TRUE WHERE auth_provider = 'GOOGLE';
