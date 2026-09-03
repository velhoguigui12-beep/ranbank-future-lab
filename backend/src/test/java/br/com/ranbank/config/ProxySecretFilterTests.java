package br.com.ranbank.config;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest(properties = "ranbank.proxy.secret=test-proxy-secret")
@AutoConfigureMockMvc
class ProxySecretFilterTests {
    @Autowired MockMvc mockMvc;

    @Test
    void keepsHealthCheckPublic() throws Exception {
        mockMvc.perform(get("/api/health"))
            .andExpect(status().isOk());
    }

    @Test
    void rejectsApiRequestWithoutProxySecret() throws Exception {
        mockMvc.perform(get("/api/dashboard"))
            .andExpect(status().isForbidden())
            .andExpect(jsonPath("$.message").value("Acesso à API não autorizado."));
    }

    @Test
    void acceptsApiRequestWithProxySecret() throws Exception {
        mockMvc.perform(get("/api/dashboard")
                .header(ProxySecretFilter.HEADER_NAME, "test-proxy-secret"))
            .andExpect(status().isUnauthorized());
    }
}
