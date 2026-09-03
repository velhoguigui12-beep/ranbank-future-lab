package br.com.ranbank.config;

import java.net.URI;
import java.nio.charset.StandardCharsets;

import javax.sql.DataSource;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.env.Environment;
import org.springframework.util.StringUtils;
import org.springframework.web.util.UriUtils;

@Configuration
@Profile("postgresql")
public class PostgreSqlDataSourceConfiguration {

    @Bean
    @ConfigurationProperties("spring.datasource.hikari")
    DataSource dataSource(Environment environment) {
        String databaseUrl = environment.getProperty("DATABASE_URL");
        if (StringUtils.hasText(databaseUrl)) {
            DatabaseConnection connection = parseDatabaseUrl(databaseUrl);
            return DataSourceBuilder.create()
                    .url(connection.jdbcUrl())
                    .username(connection.username())
                    .password(connection.password())
                    .build();
        }

        return DataSourceBuilder.create()
                .url(environment.getRequiredProperty("spring.datasource.url"))
                .username(environment.getRequiredProperty("spring.datasource.username"))
                .password(environment.getRequiredProperty("spring.datasource.password"))
                .build();
    }

    static DatabaseConnection parseDatabaseUrl(String databaseUrl) {
        URI uri = URI.create(databaseUrl);
        if (!("postgresql".equals(uri.getScheme()) || "postgres".equals(uri.getScheme()))) {
            throw new IllegalArgumentException("DATABASE_URL must use the PostgreSQL protocol");
        }
        if (!StringUtils.hasText(uri.getHost()) || !StringUtils.hasText(uri.getRawUserInfo())) {
            throw new IllegalArgumentException("DATABASE_URL must include host and credentials");
        }

        String[] credentials = uri.getRawUserInfo().split(":", 2);
        if (credentials.length != 2) {
            throw new IllegalArgumentException("DATABASE_URL must include a username and password");
        }

        String username = UriUtils.decode(credentials[0], StandardCharsets.UTF_8);
        String password = UriUtils.decode(credentials[1], StandardCharsets.UTF_8);
        int port = uri.getPort() > 0 ? uri.getPort() : 5432;
        StringBuilder jdbcUrl = new StringBuilder("jdbc:postgresql://")
                .append(uri.getHost())
                .append(':')
                .append(port)
                .append(uri.getRawPath());
        if (StringUtils.hasText(uri.getRawQuery())) {
            String jdbcQuery = uri.getRawQuery()
                    .replaceAll("(^|&)channel_binding=", "$1channelBinding=");
            jdbcUrl.append('?').append(jdbcQuery);
        }

        return new DatabaseConnection(jdbcUrl.toString(), username, password);
    }

    record DatabaseConnection(String jdbcUrl, String username, String password) {
    }
}
