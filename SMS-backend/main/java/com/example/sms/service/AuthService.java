package com.example.sms.service;

import com.example.sms.entity.Admin;
import com.example.sms.repository.AdminRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AuthService {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    /** Token 存储: token -> token 信息（含创建时间） */
    private final Map<String, TokenInfo> tokenStore = new ConcurrentHashMap<>();

    /** Token 过期时间: 24 小时 */
    private static final long TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000L;

    public AuthService(AdminRepository adminRepository, PasswordEncoder passwordEncoder) {
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * 管理员登录
     */
    public LoginResult login(String username, String password) {
        // 1. 查找用户
        Admin admin = adminRepository.findByUsername(username).orElse(null);
        if (admin == null) {
            return null;
        }

        // 2. 验证密码
        if (!passwordEncoder.matches(password, admin.getPasswordHash())) {
            return null;
        }

        // 3. 清理过期 token（防止内存泄漏）
        cleanupExpiredTokens();

        // 4. 生成 token
        String token = UUID.randomUUID().toString().replace("-", "");
        tokenStore.put(token, new TokenInfo(username, System.currentTimeMillis()));

        return new LoginResult(token, username);
    }

    /**
     * 校验 token
     * @param token 前端传来的 token
     * @return 校验通过返回用户名，否则返回空
     */
    public Optional<String> validateToken(String token) {
        TokenInfo info = tokenStore.get(token);
        if (info == null) {
            return Optional.empty();           // token 不存在
        }
        if (info.isExpired()) {
            tokenStore.remove(token);          // token 过期，顺手清理
            return Optional.empty();
        }
        return Optional.of(info.username());
    }

    /**
     * 清理所有过期 token，防止内存只增不减
     */
    private void cleanupExpiredTokens() {
        long now = System.currentTimeMillis();
        tokenStore.values().removeIf(info -> now - info.createdAt() > TOKEN_EXPIRY_MS);
    }

    /**
     * 登录结果
     */
    public record LoginResult(String token, String username) {}

    /**
     * Token 信息（含创建时间戳）
     */
    private record TokenInfo(String username, long createdAt) {
        boolean isExpired() {
            return System.currentTimeMillis() - createdAt > TOKEN_EXPIRY_MS;
        }
    }
}
