package br.com.ranbank.auth;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.junit.jupiter.api.Assertions.assertTrue;

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
        mockMvc.perform(get("/api/dashboard")).andExpect(status().isUnauthorized())
            .andExpect(header().string("X-Content-Type-Options", "nosniff"))
            .andExpect(header().string("X-Frame-Options", "DENY"))
            .andExpect(header().string("Cache-Control", "no-store, max-age=0"));

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

    @Test
    void createsAndAuthenticatesAnIndependentDemoAccount() throws Exception {
        String body = "{\"customerName\":\"Joana Teste\",\"documentId\":\"11122233344\","
            + "\"email\":\"joana.teste@ranbank.demo\",\"phoneNumber\":\"(61) 97777-3344\","
            + "\"accessPin\":\"2468\",\"transactionPin\":\"1357\"}";
        MvcResult result = mockMvc.perform(post("/api/demo-accounts").contentType(MediaType.APPLICATION_JSON).content(body))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.customerName").value("Joana Teste"))
            .andExpect(jsonPath("$.balance").value(2500.00))
            .andReturn();

        Cookie session = result.getResponse().getCookie(AuthenticationService.SESSION_COOKIE);
        mockMvc.perform(get("/api/dashboard").cookie(session))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.customerName").value("Joana Teste"))
            .andExpect(jsonPath("$.phoneNumber").value("(61) 97777-3344"))
            .andExpect(jsonPath("$.transactions").isEmpty());
    }

    @Test
    void creatingAnAccountWhileAnaSessionExistsSwitchesToTheNewAccount() throws Exception {
        Cookie anaSession = login();
        String body = "{\"customerName\":\"Carlos Novo\",\"documentId\":\"55566677788\","
            + "\"email\":\"carlos.novo@ranbank.demo\",\"phoneNumber\":\"(61) 98888-7788\","
            + "\"accessPin\":\"8642\",\"transactionPin\":\"2468\"}";

        MvcResult result = mockMvc.perform(post("/api/demo-accounts").cookie(anaSession)
                .header("X-Forwarded-Proto", "https")
                .contentType(MediaType.APPLICATION_JSON).content(body))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.customerName").value("Carlos Novo"))
            .andReturn();

        Cookie newSession = result.getResponse().getCookie(AuthenticationService.SESSION_COOKIE);
        mockMvc.perform(get("/api/dashboard").cookie(newSession))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.customerName").value("Carlos Novo"));

        mockMvc.perform(get("/api/dashboard").cookie(anaSession))
            .andExpect(status().isUnauthorized());
    }

    private Cookie login() throws Exception {
        MvcResult result = mockMvc.perform(post("/api/auth/login").header("X-Forwarded-Proto", "https").contentType(MediaType.APPLICATION_JSON)
                .content("{\"identification\":\"12345678909\",\"pin\":\"2580\"}"))
            .andExpect(status().isOk()).andReturn();
        String setCookie = result.getResponse().getHeader("Set-Cookie");
        assertTrue(setCookie != null && setCookie.contains("HttpOnly") && setCookie.contains("Secure")
            && setCookie.contains("SameSite=Strict"));
        return result.getResponse().getCookie(AuthenticationService.SESSION_COOKIE);
    }
}
