package br.com.ranbank.banking;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.com.ranbank.auth.AuthenticationService;
import jakarta.servlet.http.Cookie;
import java.time.LocalDate;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
class BankingControllerTests {
    @Autowired MockMvc mockMvc;
    private Cookie session;

    @BeforeEach
    void restoreDemo() throws Exception {
        session = login();
        mockMvc.perform(post("/api/demo/reset").cookie(session)).andExpect(status().isOk());
    }

    @Test
    void paysBillAndUpdatesAvailableBalance() throws Exception {
        String body = """
            {"barcode":"00190500954014481606906809350314337370000000100","payee":"Energia Brasilia","amount":40,"transactionPin":"7314"}
            """;

        mockMvc.perform(post("/api/banking/bills").cookie(session)
                .contentType(MediaType.APPLICATION_JSON).content(body))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.operation").value("Boleto"))
            .andExpect(jsonPath("$.amount").value(40));

        mockMvc.perform(get("/api/banking/overview").cookie(session))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.balance").value(8500.75));
    }

    @Test
    void validatesAndMasksScheduledPixKey() throws Exception {
        String invalid = "{\"pixKey\":\"nome qualquer\",\"amount\":25,\"scheduledDate\":\""
            + LocalDate.now().plusDays(1) + "\",\"transactionPin\":\"7314\"}";
        mockMvc.perform(post("/api/banking/schedules").cookie(session)
                .contentType(MediaType.APPLICATION_JSON).content(invalid))
            .andExpect(status().isUnprocessableEntity());

        String valid = "{\"pixKey\":\"cliente@ranbank.com\",\"amount\":25,\"scheduledDate\":\""
            + LocalDate.now().plusDays(1) + "\",\"transactionPin\":\"7314\"}";
        mockMvc.perform(post("/api/banking/schedules").cookie(session)
                .contentType(MediaType.APPLICATION_JSON).content(valid))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.recipient").value("cliente@ranbank.com"))
            .andExpect(jsonPath("$.status").value("AGENDADO"));
    }

    @Test
    void movesMoneyToSavingsAndTogglesVirtualCard() throws Exception {
        mockMvc.perform(post("/api/banking/savings/deposit").cookie(session)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"amount\":500,\"transactionPin\":\"7314\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.balance").value(8040.75))
            .andExpect(jsonPath("$.savingsBalance").value(500));

        mockMvc.perform(patch("/api/banking/card/toggle").cookie(session))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.blocked").value(true));
    }

    private Cookie login() throws Exception {
        MvcResult result = mockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                .content("{\"identification\":\"12345678909\",\"pin\":\"2580\"}"))
            .andExpect(status().isOk()).andReturn();
        return result.getResponse().getCookie(AuthenticationService.SESSION_COOKIE);
    }
}
