package br.com.ranbank.pix;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
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
class PixKeyManagementTests {
    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    @Test
    void managesEmailCpfPhoneAndRandomKeys() throws Exception {
        Cookie session = createAccount();
        mockMvc.perform(get("/api/pix/keys").cookie(session))
            .andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(1));

        mockMvc.perform(post("/api/pix/keys").cookie(session).contentType(MediaType.APPLICATION_JSON)
                .content("{\"type\":\"CPF\",\"value\":\"44455566677\"}"))
            .andExpect(status().isCreated()).andExpect(jsonPath("$.type").value("CPF"));
        mockMvc.perform(post("/api/pix/keys").cookie(session).contentType(MediaType.APPLICATION_JSON)
                .content("{\"type\":\"PHONE\",\"value\":\"+55 11 99999-0000\"}"))
            .andExpect(status().isCreated()).andExpect(jsonPath("$.type").value("PHONE"));
        mockMvc.perform(post("/api/pix/keys").cookie(session).contentType(MediaType.APPLICATION_JSON)
                .content("{\"type\":\"RANDOM\"}"))
            .andExpect(status().isCreated()).andExpect(jsonPath("$.type").value("RANDOM"));

        MvcResult listed = mockMvc.perform(get("/api/pix/keys").cookie(session))
            .andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(4)).andReturn();
        JsonNode keys = objectMapper.readTree(listed.getResponse().getContentAsString());
        long phoneId = 0L;
        for (JsonNode key : keys) if ("PHONE".equals(key.get("type").asText())) phoneId = key.get("id").asLong();
        mockMvc.perform(delete("/api/pix/keys/{id}", phoneId).cookie(session)).andExpect(status().isOk());
    }

    private Cookie createAccount() throws Exception {
        String body = """
            {"customerName":"Chaves Teste","documentId":"44455566677","email":"chaves@ranbank.demo",
             "accessPin":"2468","transactionPin":"1357"}
            """;
        MvcResult result = mockMvc.perform(post("/api/demo-accounts").contentType(MediaType.APPLICATION_JSON).content(body))
            .andExpect(status().isCreated()).andReturn();
        return result.getResponse().getCookie(AuthenticationService.SESSION_COOKIE);
    }
}
