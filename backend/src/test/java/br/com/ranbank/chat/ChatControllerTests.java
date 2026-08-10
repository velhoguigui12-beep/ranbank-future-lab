package br.com.ranbank.chat;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class ChatControllerTests {
    @Autowired MockMvc mockMvc;

    @Test
    void respondsToOi() throws Exception {
        ask("Oi").andExpect(status().isOk()).andExpect(jsonPath("$.topic").value("Boas-vindas")).andExpect(jsonPath("$.answer").value(org.hamcrest.Matchers.startsWith("Olá!")));
    }

    @Test
    void respondsToOlaWithAccent() throws Exception {
        ask("Olá").andExpect(status().isOk()).andExpect(jsonPath("$.topic").value("Boas-vindas"));
    }

    @Test
    void distinguishesArtificialIntelligenceFromSustainability() throws Exception {
        ask("Como a IA ajuda?").andExpect(jsonPath("$.topic").value("Inteligência Artificial"));
        ask("O que é energia sustentável?").andExpect(jsonPath("$.topic").value("Tecnologia sustentável"));
    }

    @Test
    void rejectsBlankQuestions() throws Exception {
        ask(" ").andExpect(status().isBadRequest());
    }

    private org.springframework.test.web.servlet.ResultActions ask(String message) throws Exception {
        String json = "{\"message\":\"" + message + "\"}";
        return mockMvc.perform(post("/api/chat").contentType(MediaType.APPLICATION_JSON).content(json));
    }
}
