package com.example.sms.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")          // 允许哪些路径
                .allowedOriginPatterns("*")     // 允许哪些来源（* = 所有）
                .allowedMethods("*")            // 允许哪些方法（GET/POST等）
                .allowCredentials(true);        // 允许携带凭证
    }
}
