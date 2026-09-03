package br.com.ranbank;

import static org.assertj.core.api.Assertions.assertThat;

import br.com.ranbank.account.BankAccountRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@SpringBootTest(properties = {
    "spring.jpa.hibernate.ddl-auto=validate",
    "spring.flyway.enabled=true"
})
@Testcontainers(disabledWithoutDocker = true)
class PostgreSqlIntegrationTests {
    @Container
    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:17-alpine")
        .withDatabaseName("ranbank")
        .withUsername("ranbank")
        .withPassword("ranbank");

    @DynamicPropertySource
    static void database(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.datasource.driver-class-name", postgres::getDriverClassName);
    }

    @Autowired BankAccountRepository accounts;

    @Test
    void appliesFlywayMigrationsAndLoadsOnlyThePrimaryDemoAccountOnPostgreSql() {
        assertThat(accounts.findById(1L)).isPresent();
        assertThat(accounts.findAll()).hasSize(1);
    }
}
