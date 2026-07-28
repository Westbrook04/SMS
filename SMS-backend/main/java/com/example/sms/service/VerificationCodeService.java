package com.example.sms.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 手机验证码服务（模拟 Redis 实现）。
 *
 * 真实项目中这里用 Redis: SET sms:code:138xxxx 123456 EX 300
 * 这里用 ConcurrentHashMap + 过期时间戳模拟，接口保持不变，
 * 以后接真 Redis 时只需替换本类的存储实现。
 */
@Service
public class VerificationCodeService {

    private static final Logger log = LoggerFactory.getLogger(VerificationCodeService.class);

    /** 验证码有效期: 5 分钟 */
    private static final long CODE_EXPIRY_MS = 5 * 60 * 1000L;

    /** 发送间隔限制: 60 秒内不允许重复发送（防短信轰炸） */
    private static final long RESEND_INTERVAL_MS = 60 * 1000L;

    private final SecureRandom random = new SecureRandom();

    /** 模拟 Redis: phone -> 验证码信息（含过期时间） */
    private final Map<String, CodeInfo> codeStore = new ConcurrentHashMap<>();

    /**
     * 发送验证码（模拟发短信，实际打印到日志）。
     *
     * @return true 发送成功；false 发送过于频繁，被限流
     */
    public boolean sendCode(String phone) {
        CodeInfo existing = codeStore.get(phone);

        // 限流：60 秒内已发过，拒绝重复发送
        if (existing != null
                && System.currentTimeMillis() - existing.createdAt() < RESEND_INTERVAL_MS) {
            return false;
        }

        // 生成 6 位数字验证码（SecureRandom 比 Random 更安全，不易被预测）
        String code = String.format("%06d", random.nextInt(1_000_000));
        codeStore.put(phone, new CodeInfo(code, System.currentTimeMillis()));

        // 模拟短信通道：真实项目在这里调用阿里云/腾讯云短信 SDK
        log.info("【模拟短信】发送验证码 {} 到手机 {}", code, phone);
        return true;
    }

    /**
     * 校验验证码。无论成功失败，只要匹配过一次就删除（一次性使用，防暴力复用）。
     *
     * @return true 校验通过
     */
    public boolean verifyCode(String phone, String code) {
        CodeInfo info = codeStore.get(phone);
        if (info == null || info.isExpired()) {
            codeStore.remove(phone);   // 不存在或已过期，顺手清理
            return false;
        }
        if (!info.code().equals(code)) {
            return false;              // 验证码错误，保留有效码允许重试
        }
        codeStore.remove(phone);       // 验证成功，立即删除，一次性使用
        return true;
    }

    /**
     * 验证码信息（含生成时间戳）
     */
    private record CodeInfo(String code, long createdAt) {
        boolean isExpired() {
            return System.currentTimeMillis() - createdAt > CODE_EXPIRY_MS;
        }
    }
}
