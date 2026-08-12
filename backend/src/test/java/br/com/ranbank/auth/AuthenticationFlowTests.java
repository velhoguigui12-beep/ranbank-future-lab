package br.com.ranbank.auth;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
class AuthenticationFlowTests {
    @Autowired MockMvc mockMvc;

    @Test
    void protectsDashboardAndCreatesSessionWithCorrectPin() throws Exception {
        mockMvc.perform(get("/api/dashboard")).andExpect(status().isUnauthorized());

        Cookie session = login();
        mockMvc.perform(get("/api/dashboard").cookie(session))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.customerName").value("Ana Ribeiro"));
    }

    @Test
    void rejectsWrongAccessPin() throws Exception {
        mockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                .content("{\"identification\":\"12345678909\",\"pin\":\"9999\"}"))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.message").value("CPF, conta ou PIN inválido."));
    }

    @Test
    void requiresTheSeparateTransactionPin() throws Exception {
        Cookie session = login();
        String wrongPin = "{\"pixKey\":\"ana@example.com\",\"amount\":10,\"transactionPin\":\"9999\"}";
        mockMvc.perform(post("/api/transactions").cookie(session).contentType(MediaType.APPLICATION_JSON).content(wrongPin))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.message").value("Senha de quatro dígitos incorreta."));
    }

    private Cookie login() throws Exception {
        MvcResult result = mockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                .content("{\"identification\":\"12345678909\",\"pin\":\"2580\"}"))
            .andExpect(status().isOk()).andReturn();
        return result.getResponse().getCookie(AuthenticationService.SESSION_COOKIE);
    }
}
