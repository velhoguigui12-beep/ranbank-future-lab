package br.com.ranbank.config;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Stream;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfiguration implements WebMvcConfigurer {
    private static final String HOSTED_FRONTEND_ORIGIN = "https://ranbank-future-lab.onrender.com";
    private final List<String> allowedOriginPatterns;

    public CorsConfiguration(@Value("${app.cors.allowed-origin-patterns:http://localhost:3000,http://localhost:5173}") String patterns) {
        this.allowedOriginPatterns = Stream.concat(
                Arrays.stream(patterns.split(",")),
                Stream.of(HOSTED_FRONTEND_ORIGIN))
            .map(String::trim)
            .filter(value -> !value.isBlank() && !value.contains("*"))
            .distinct()
            .toList();
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOriginPatterns(allowedOriginPatterns.toArray(String[]::new))
            .allowedMethods("GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS")
            .allowedHeaders("*")
            .allowCredentials(true);
    }
}

