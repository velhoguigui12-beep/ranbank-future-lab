package br.com.ranbank;

import static org.assertj.core.api.Assertions.assertThat;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;
import org.flywaydb.core.Flyway;
import org.flywaydb.core.api.MigrationVersion;
import org.junit.jupiter.api.Test;

class OneTimeDatabaseResetMigrationTests {
    private static final String URL = "jdbc:h2:mem:ranbank-reset-migration;MODE=PostgreSQL;DB_CLOSE_DELAY=-1";

    @Test
    void migrationKeepsOnlyAnaAndClearsOperationalData() throws Exception {
        Flyway.configure()
            .dataSource(URL, "sa", "")
            .locations("classpath:db/migration")
            .target(MigrationVersion.fromVersion("10"))
            .load()
            .migrate();

        try (Connection connection = DriverManager.getConnection(URL, "sa", "");
             Statement statement = connection.createStatement()) {
            statement.executeUpdate("""
                INSERT INTO bank_accounts
                    (id, customer_name, account_number, balance, document_id, card_blocked, active, version)
                VALUES
                    (1, 'Ana Ribeiro', '1234-5', 1.00, '12345678909', TRUE, TRUE, 0),
                    (2, 'Conta temporária', '9999-9', 50.00, '11144477735', FALSE, TRUE, 0)
                """);
            statement.executeUpdate("""
                INSERT INTO bank_transactions (account_id, title, detail, amount, type, occurred_at)
                VALUES (2, 'Pix recebido', 'Teste', 10.00, 'credit', CURRENT_TIMESTAMP)
                """);
            statement.executeUpdate("""
                INSERT INTO pix_keys (account_id, key_type, normalized_key, display_key, created_at)
                VALUES (2, 'EMAIL', 'temporaria@ranbank.demo', 'temporaria@ranbank.demo', CURRENT_TIMESTAMP)
                """);
        }

        Flyway.configure()
            .dataSource(URL, "sa", "")
            .locations("classpath:db/migration")
            .load()
            .migrate();

        try (Connection connection = DriverManager.getConnection(URL, "sa", "");
             Statement statement = connection.createStatement()) {
            assertThat(singleLong(statement, "SELECT COUNT(*) FROM bank_accounts")).isEqualTo(1);
            assertThat(singleLong(statement, "SELECT COUNT(*) FROM bank_accounts WHERE id = 1 AND customer_name = 'Ana Ribeiro'"))
                .isEqualTo(1);
            assertThat(singleLong(statement, "SELECT COUNT(*) FROM bank_transactions")).isZero();
            assertThat(singleLong(statement, "SELECT COUNT(*) FROM pix_keys")).isZero();
            assertThat(singleDecimal(statement, "SELECT balance FROM bank_accounts WHERE id = 1")).isEqualTo("8540.75");
            assertThat(singleBoolean(statement, "SELECT card_blocked FROM bank_accounts WHERE id = 1")).isFalse();
        }
    }

    private long singleLong(Statement statement, String sql) throws Exception {
        try (ResultSet result = statement.executeQuery(sql)) {
            result.next();
            return result.getLong(1);
        }
    }

    private String singleDecimal(Statement statement, String sql) throws Exception {
        try (ResultSet result = statement.executeQuery(sql)) {
            result.next();
            return result.getBigDecimal(1).toPlainString();
        }
    }

    private boolean singleBoolean(Statement statement, String sql) throws Exception {
        try (ResultSet result = statement.executeQuery(sql)) {
            result.next();
            return result.getBoolean(1);
        }
    }
}
