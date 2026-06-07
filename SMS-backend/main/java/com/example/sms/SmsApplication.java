package com.example.sms;

import com.example.sms.entity.Admin;
import com.example.sms.repository.AdminRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class SmsApplication {

    public static void main(String[] args) {
        SpringApplication.run(SmsApplication.class, args);
    }

    /**
     * 初始化默认管理员账号（admin / admin123）
     */
    @Bean
    public CommandLineRunner initAdmin(AdminRepository adminRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (adminRepository.findByUsername("admin").isEmpty()) {
                Admin admin = new Admin();
                admin.setUsername("admin");
                admin.setPasswordHash(passwordEncoder.encode("admin123"));
                adminRepository.save(admin);
                System.out.println("✅ 默认管理员已创建: admin / admin123");
            }
        };
    }
}
