package br.com.ranbank.pix;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.com.ranbank.account.BankAccountRepository;
import br.com.ranbank.auth.AuthenticationService;
import jakarta.servlet.http.Cookie;
import java.math.BigDecimal;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import com.fasterxml.jackson.databind.ObjectMapper;

@SpringBootTest
@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class PixTransferFlowTests {
    @Autowired MockMvc mockMvc;
    @Autowired BankAccountRepository accounts;

    @Test
    void transfersBetweenAccountsExactlyOnceAndCreatesReceipt() throws Exception {
        Long recipientId = createRecipient();
        Cookie session = login();
        BigDecimal senderBefore = accounts.findById(1L).orElseThrow().getBalance();
        BigDecimal recipientBefore = accounts.findById(recipientId).orElseThrow().getBalance();
        String body = "{\"pixKey\":\"pix.recipient@ranbank.demo\",\"amount\":15.50,\"transactionPin\":\"7314\"}";

        MvcResult first = mockMvc.perform(post("/api/pix/transfers").cookie(session)
                .header("Idempotency-Key", "pix-test-001")
                .contentType(MediaType.APPLICATION_JSON).content(body))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.recipientName").value("Destinatária Pix"))
            .andReturn();
        String transferId = new com.fasterxml.jackson.databind.ObjectMapper()
            .readTree(first.getResponse().getContentAsString()).get("transferId").asText();

        mockMvc.perform(post("/api/pix/transfers").cookie(session)
                .header("Idempotency-Key", "pix-test-001")
                .contentType(MediaType.APPLICATION_JSON).content(body))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.transferId").value(transferId));

        assertThat(accounts.findById(1L).orElseThrow().getBalance())
            .isEqualByComparingTo(senderBefore.subtract(new BigDecimal("15.50")));
        assertThat(accounts.findById(recipientId).orElseThrow().getBalance())
            .isEqualByComparingTo(recipientBefore.add(new BigDecimal("15.50")));

        mockMvc.perform(get("/api/pix/transfers/{id}/receipt", transferId).cookie(session))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("COMPLETED"));
        mockMvc.perform(get("/api/notifications").cookie(session))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].referenceId").value(transferId));
    }

    private Long createRecipient() throws Exception {
        MvcResult result = mockMvc.perform(post("/api/demo-accounts")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"customerName\":\"Destinatária Pix\",\"documentId\":\"52998224725\","
                    + "\"email\":\"pix.recipient@ranbank.demo\",\"phoneNumber\":\"61988884455\","
                    + "\"accessPin\":\"2468\",\"transactionPin\":\"1357\"}"))
            .andExpect(status().isCreated()).andReturn();
        return new ObjectMapper().readTree(result.getResponse().getContentAsString()).get("accountId").asLong();
    }

    private Cookie login() throws Exception {
        MvcResult result = mockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                .content("{\"identification\":\"12345678909\",\"pin\":\"2580\"}"))
            .andExpect(status().isOk()).andReturn();
        return result.getResponse().getCookie(AuthenticationService.SESSION_COOKIE);
    }
}
