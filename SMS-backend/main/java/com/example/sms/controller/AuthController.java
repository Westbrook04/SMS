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
     * 发送手机验证码
     */
    @PostMapping("/code/send")
    public Map<String, Object> sendCode(@RequestBody SendCodeRequest request) {
        boolean sent = authService.sendLoginCode(request.phone());

        Map<String, Object> response = new HashMap<>();
        if (!sent) {
            response.put("success", false);
            response.put("data", null);
            response.put("error", "发送过于频繁，请 60 秒后再试");
        } else {
            response.put("success", true);
            response.put("data", Map.of("message", "验证码已发送，5 分钟内有效"));
            response.put("error", null);
        }
        return response;
    }

    /**
     * 手机号 + 验证码登录
     */
    @PostMapping("/login-by-code")
    public Map<String, Object> loginByCode(@RequestBody LoginByCodeRequest request) {
        AuthService.LoginResult result = authService.loginByPhone(request.phone(), request.code());

        Map<String, Object> response = new HashMap<>();
        if (result == null) {
            response.put("success", false);
            response.put("data", null);
            response.put("error", "验证码错误或该手机号未绑定账号");
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

    /**
     * 发送验证码请求体
     */
    public record SendCodeRequest(String phone) {}

    /**
     * 验证码登录请求体
     */
    public record LoginByCodeRequest(String phone, String code) {}
}
