package com.example.sms.controller;

import com.example.sms.service.AuthService;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * 管理员登录
     */
    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody LoginRequest request) {
        System.out.println("登录请求 - 用户名: " + request.username() + ", 密码: " + request.password());
        AuthService.LoginResult result = authService.login(request.username(), request.password());

        Map<String, Object> response = new HashMap<>();
        if (result == null) {
            response.put("success", false);
            response.put("data", null);
            response.put("error", "用户名或密码错误");
        } else {
            response.put("success", true);
            response.put("data", Map.of("token", result.token(), "username", result.username()));
            response.put("error", null);
        }
        return response;
    }

    /**
     * 登录请求体
     */
    public record LoginRequest(String username, String password) {}
}
