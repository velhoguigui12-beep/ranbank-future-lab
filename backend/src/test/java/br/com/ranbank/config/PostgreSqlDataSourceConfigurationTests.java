package br.com.ranbank.config;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class PostgreSqlDataSourceConfigurationTests {

    @Test
    void convertsProviderConnectionStringToJdbcProperties() {
        PostgreSqlDataSourceConfiguration.DatabaseConnection connection =
                PostgreSqlDataSourceConfiguration.parseDatabaseUrl(
                        "postgresql://ranbank:p%40ss%2Bword@db.internal:5433/ranbank?sslmode=require");

        assertThat(connection.jdbcUrl())
                .isEqualTo("jdbc:postgresql://db.internal:5433/ranbank?sslmode=require");
        assertThat(connection.username()).isEqualTo("ranbank");
        assertThat(connection.password()).isEqualTo("p@ss+word");
    }

    @Test
    void acceptsNeonConnectionStringAndNormalizesChannelBinding() {
        PostgreSqlDataSourceConfiguration.DatabaseConnection connection =
                PostgreSqlDataSourceConfiguration.parseDatabaseUrl(
                        "postgresql://ranbank:secret@ep-demo-pooler.neon.tech/neondb"
                            + "?sslmode=require&channel_binding=require");

        assertThat(connection.jdbcUrl()).isEqualTo(
                "jdbc:postgresql://ep-demo-pooler.neon.tech:5432/neondb"
                    + "?sslmode=require&channelBinding=require");
    }

    @Test
    void usesPostgreSqlDefaultPortWhenConnectionStringOmitsIt() {
        PostgreSqlDataSourceConfiguration.DatabaseConnection connection =
                PostgreSqlDataSourceConfiguration.parseDatabaseUrl(
                        "postgres://ranbank:secret@db.internal/ranbank");

        assertThat(connection.jdbcUrl()).isEqualTo("jdbc:postgresql://db.internal:5432/ranbank");
    }
}
