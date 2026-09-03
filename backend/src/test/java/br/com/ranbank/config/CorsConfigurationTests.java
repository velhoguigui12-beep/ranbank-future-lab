package br.com.ranbank.config;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest(properties =
    "app.cors.allowed-origin-patterns=http://localhost:3000,https://ranbank.example")
@AutoConfigureMockMvc
class CorsConfigurationTests {
    @Autowired MockMvc mockMvc;

    @Test
    void allowsOnlyTheConfiguredFrontend() throws Exception {
        mockMvc.perform(options("/api/health")
                .header("Origin", "https://ranbank.example")
                .header("Access-Control-Request-Method", "GET"))
            .andExpect(status().isOk())
            .andExpect(header().string("Access-Control-Allow-Origin",
                "https://ranbank.example"))
            .andExpect(header().string("Access-Control-Allow-Credentials", "true"));
    }

    @Test
    void rejectsOtherApplications() throws Exception {
        mockMvc.perform(options("/api/health")
                .header("Origin", "https://untrusted.example")
                .header("Access-Control-Request-Method", "GET"))
            .andExpect(status().isForbidden())
            .andExpect(header().doesNotExist("Access-Control-Allow-Origin"));
    }
}
