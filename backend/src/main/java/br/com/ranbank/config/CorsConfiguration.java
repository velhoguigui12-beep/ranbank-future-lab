package br.com.ranbank.config;

import java.util.Arrays;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfiguration implements WebMvcConfigurer {
    private final List<String> allowedOriginPatterns;

    public CorsConfiguration(@Value("${app.cors.allowed-origin-patterns:http://localhost:3000,http://localhost:5173,https://*.chatgpt.site}") String patterns) {
        this.allowedOriginPatterns = Arrays.stream(patterns.split(",")).map(String::trim).filter(value -> !value.isBlank()).toList();
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOriginPatterns(allowedOriginPatterns.toArray(String[]::new))
            .allowedMethods("GET", "POST", "PATCH", "OPTIONS")
            .allowedHeaders("*");
    }
}
