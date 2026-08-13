package br.com.ranbank.innovation;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.com.ranbank.auth.AuthenticationService;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

@SpringBootTest
@AutoConfigureMockMvc
class InnovationControllerTests {
    @Autowired MockMvc mockMvc;

    @Test
    void exposesConnectedInnovationJourney() throws Exception {
        Cookie session = login();
        mockMvc.perform(get("/api/innovation/open-finance").cookie(session))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.institutions.length()").value(3));
        mockMvc.perform(get("/api/innovation/audit").cookie(session))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.integrityVerified").value(true))
            .andExpect(jsonPath("$.entries.length()").value(5));
        mockMvc.perform(get("/api/innovation/fraud-journey").cookie(session))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.riskScore").value(68))
            .andExpect(jsonPath("$.steps.length()").value(6));
    }

    private Cookie login() throws Exception {
        MvcResult result = mockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                .content("{\"identification\":\"12345678909\",\"pin\":\"2580\"}"))
            .andExpect(status().isOk()).andReturn();
        return result.getResponse().getCookie(AuthenticationService.SESSION_COOKIE);
    }
}
