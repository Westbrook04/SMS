package com.example.sms.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "admin")
public class Admin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 50)
    private String username;

    @Column(nullable = false, length = 255)
    private String passwordHash;

    /** 手机号，用于验证码登录；老数据可能为空，所以允许 null */
    @Column(unique = true, length = 20)
    private String phone;
}
