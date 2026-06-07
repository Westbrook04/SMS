package com.example.sms.config;

import com.example.sms.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class AuthInterceptor implements HandlerInterceptor {

    private final AuthService authService;

    public AuthInterceptor(AuthService authService) {
        this.authService = authService;
    }

    @Override
    public boolean preHandle(HttpServletRequest request,
                             HttpServletResponse response,
                             Object handler) throws Exception {

        // 从请求头取出 token: "Authorization: Bearer xxxxxxx"
        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            response.setStatus(401);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"success\":false,\"data\":null,\"error\":\"未登录或 token 为空\"}");
            return false;
        }

        // 去掉 "Bearer " 前缀，拿到真正的 token
        String token = authHeader.substring(7);

        // 校验 token（过期或无效返回空）
        if (authService.validateToken(token).isEmpty()) {
            response.setStatus(401);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"success\":false,\"data\":null,\"error\":\"token 无效或已过期\"}");
            return false;
        }

        return true; // 放行
    }
}
