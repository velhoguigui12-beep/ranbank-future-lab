package br.com.ranbank.config;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class PostgreSqlDataSourceConfigurationTests {

    @Test
    void convertsRenderConnectionStringToJdbcProperties() {
        PostgreSqlDataSourceConfiguration.DatabaseConnection connection =
                PostgreSqlDataSourceConfiguration.parseRenderDatabaseUrl(
                        "postgresql://ranbank:p%40ss%2Bword@db.internal:5433/ranbank?sslmode=require");

        assertThat(connection.jdbcUrl())
                .isEqualTo("jdbc:postgresql://db.internal:5433/ranbank?sslmode=require");
        assertThat(connection.username()).isEqualTo("ranbank");
        assertThat(connection.password()).isEqualTo("p@ss+word");
    }

    @Test
    void usesPostgreSqlDefaultPortWhenConnectionStringOmitsIt() {
        PostgreSqlDataSourceConfiguration.DatabaseConnection connection =
                PostgreSqlDataSourceConfiguration.parseRenderDatabaseUrl(
                        "postgres://ranbank:secret@db.internal/ranbank");

        assertThat(connection.jdbcUrl()).isEqualTo("jdbc:postgresql://db.internal:5432/ranbank");
    }
}
