package br.com.ranbank.account;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.com.ranbank.auth.AuthenticationService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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
class AccountLifecycleTests {
    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    @Test
    void recoversAccessPinWithEmailAndTransactionPin() throws Exception {
        createAccount("Recuperação Teste", "22233344455", "recuperacao@ranbank.demo", "2468", "1357");

        mockMvc.perform(post("/api/auth/recover-pin").contentType(MediaType.APPLICATION_JSON).content("""
                {"identification":"22233344455","email":"recuperacao@ranbank.demo",
                 "transactionPin":"1357","newAccessPin":"8642"}
                """))
            .andExpect(status().isOk());

        login("22233344455", "8642").andExpect(status().isOk());
        login("22233344455", "2468").andExpect(status().isUnauthorized());
    }

    @Test
    void administratorCanDeactivateReactivateAndAnonymizeTestAccount() throws Exception {
        MvcResult created = createAccount("Conta Gerenciada", "33344455566", "gerenciada@ranbank.demo", "2468", "1357");
        long accountId = objectMapper.readTree(created.getResponse().getContentAsString()).get("accountId").asLong();
        Cookie admin = adminLogin();

        mockMvc.perform(patch("/api/admin/accounts/{id}/status", accountId).cookie(admin)
                .contentType(MediaType.APPLICATION_JSON).content("{\"active\":false}"))
            .andExpect(status().isOk()).andExpect(jsonPath("$.active").value(false));
        login("33344455566", "2468").andExpect(status().isForbidden());

        mockMvc.perform(patch("/api/admin/accounts/{id}/status", accountId).cookie(admin)
                .contentType(MediaType.APPLICATION_JSON).content("{\"active\":true}"))
            .andExpect(status().isOk()).andExpect(jsonPath("$.active").value(true));
        login("33344455566", "2468").andExpect(status().isOk());

        mockMvc.perform(delete("/api/admin/accounts/{id}", accountId).cookie(admin))
            .andExpect(status().isOk());
        login("33344455566", "2468").andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/admin/accounts").cookie(admin))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[?(@.id == " + accountId + ")].deleted").value(true));
    }

    private MvcResult createAccount(String name, String document, String email, String accessPin,
                                    String transactionPin) throws Exception {
        String body = objectMapper.writeValueAsString(new CreateAccount(name, document, email, accessPin, transactionPin));
        return mockMvc.perform(post("/api/demo-accounts").contentType(MediaType.APPLICATION_JSON).content(body))
            .andExpect(status().isCreated()).andReturn();
    }

    private org.springframework.test.web.servlet.ResultActions login(String identification, String pin) throws Exception {
        String body = objectMapper.writeValueAsString(new Login(identification, pin));
        return mockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON).content(body));
    }

    private Cookie adminLogin() throws Exception {
        MvcResult result = login("12345678909", "2580").andExpect(status().isOk()).andReturn();
        return result.getResponse().getCookie(AuthenticationService.SESSION_COOKIE);
    }

    record CreateAccount(String customerName, String documentId, String email, String accessPin, String transactionPin) {}
    record Login(String identification, String pin) {}
}
