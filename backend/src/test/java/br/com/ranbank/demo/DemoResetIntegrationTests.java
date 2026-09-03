package br.com.ranbank.demo;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.com.ranbank.account.BankAccountRepository;
import br.com.ranbank.auth.AuthenticationService;
import br.com.ranbank.pix.PixTransferRepository;
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
class DemoResetIntegrationTests {
    @Autowired MockMvc mockMvc;
    @Autowired BankAccountRepository accounts;
    @Autowired PixTransferRepository transfers;

    @Test
    void resetRestoresAnaWithoutRemovingOtherAccounts() throws Exception {
        Long recipientId = createRecipient();
        Cookie session = login();
        BigDecimal recipientBefore = accounts.findById(recipientId).orElseThrow().getBalance();

        mockMvc.perform(post("/api/pix/transfers").cookie(session)
                .header("Idempotency-Key", "reset-test-001")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"pixKey\":\"reset.recipient@ranbank.demo\",\"amount\":37.25,\"transactionPin\":\"7314\"}"))
            .andExpect(status().isCreated());

        mockMvc.perform(post("/api/demo/reset").cookie(session))
            .andExpect(status().isOk());

        assertThat(accounts.findById(1L).orElseThrow().getBalance()).isEqualByComparingTo("8540.75");
        assertThat(accounts.findById(recipientId).orElseThrow().getBalance())
            .isEqualByComparingTo(recipientBefore);
        assertThat(transfers.findBySenderAccountIdAndIdempotencyKey(1L, "reset-test-001")).isEmpty();
    }

    private Long createRecipient() throws Exception {
        MvcResult result = mockMvc.perform(post("/api/demo-accounts")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"customerName\":\"Conta para Reset\",\"documentId\":\"11144477735\","
                    + "\"email\":\"reset.recipient@ranbank.demo\",\"phoneNumber\":\"61977773344\","
                    + "\"accessPin\":\"2468\",\"transactionPin\":\"1357\"}"))
            .andExpect(status().isCreated()).andReturn();
        return new ObjectMapper().readTree(result.getResponse().getContentAsString()).get("accountId").asLong();
    }

    private Cookie login() throws Exception {
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"identification\":\"12345678909\",\"pin\":\"2580\"}"))
            .andExpect(status().isOk()).andReturn();
        return result.getResponse().getCookie(AuthenticationService.SESSION_COOKIE);
    }
}
