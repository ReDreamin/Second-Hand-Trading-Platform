package com.secondhand.platform.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {

    private String token;
    private UserInfo user;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UserInfo {
        private Long id;
        private String username;
        private String email;
        private String phone;
        private String avatar;
        private LocalDateTime createdAt;
    }

    public static AuthResponse of(String token, Long userId, String username, String email, String phone, LocalDateTime createdAt) {
        return AuthResponse.builder()
                .token(token)
                .user(UserInfo.builder()
                        .id(userId)
                        .username(username)
                        .email(email)
                        .phone(phone)
                        .createdAt(createdAt)
                        .build())
                .build();
    }
}
