package com.vjeditor.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Arrays;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Value("${vjeditor.frontend-origins:http://localhost:5173,http://localhost:5174}")
    private String frontendOrigins;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(Arrays.stream(frontendOrigins.split(","))
                        .map(String::trim)
                        .toArray(String[]::new))
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*");
    }
}
