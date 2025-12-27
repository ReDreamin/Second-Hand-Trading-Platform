package com.secondhand.platform.service;

import com.secondhand.platform.dto.AuthResponse;
import com.secondhand.platform.dto.ChangePasswordRequest;
import com.secondhand.platform.dto.LoginRequest;
import com.secondhand.platform.dto.RegisterRequest;
import com.secondhand.platform.entity.UserAccount;
import com.secondhand.platform.entity.UserProfile;
import com.secondhand.platform.exception.BusinessException;
import com.secondhand.platform.repository.UserAccountRepository;
import com.secondhand.platform.repository.UserProfileRepository;
import com.secondhand.platform.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserAccountRepository userAccountRepository;
    private final UserProfileRepository userProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Check if username already exists
        if (userAccountRepository.existsByUsername(request.getUsername())) {
            throw new BusinessException(400, "Username already exists");
        }

        // Check if email already exists
        if (userAccountRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException(400, "Email already exists");
        }

        // Check if phone already exists (if provided)
        if (StringUtils.hasText(request.getPhone()) &&
                userAccountRepository.existsByPhone(request.getPhone())) {
            throw new BusinessException(400, "Phone number already exists");
        }

        // Create user account
        UserAccount userAccount = UserAccount.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .phone(StringUtils.hasText(request.getPhone()) ? request.getPhone() : null)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .passwordAlgo("argon2")
                .status((short) 1)
                .build();

        userAccount = userAccountRepository.save(userAccount);

        // Create user profile with default values
        UserProfile userProfile = UserProfile.builder()
                .userAccount(userAccount)
                .nickname(request.getUsername())
                .build();

        userProfileRepository.save(userProfile);

        // Generate JWT token
        String token = jwtUtil.generateToken(userAccount.getId(), userAccount.getUsername());

        return AuthResponse.of(token, userAccount.getId(), userAccount.getUsername(), userAccount.getEmail());
    }

    public AuthResponse login(LoginRequest request) {
        // Find user by username
        UserAccount userAccount = userAccountRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new BusinessException(401, "Invalid username or password"));

        // Check if user is active
        if (userAccount.getStatus() != 1) {
            throw new BusinessException(403, "Account is disabled or deleted");
        }

        // Verify password
        if (!passwordEncoder.matches(request.getPassword(), userAccount.getPasswordHash())) {
            throw new BusinessException(401, "Invalid username or password");
        }

        // Generate JWT token
        String token = jwtUtil.generateToken(userAccount.getId(), userAccount.getUsername());

        return AuthResponse.of(token, userAccount.getId(), userAccount.getUsername(), userAccount.getEmail());
    }

    @Transactional
    public void changePassword(String username, ChangePasswordRequest request) {
        // Find user by username
        UserAccount userAccount = userAccountRepository.findByUsername(username)
                .orElseThrow(() -> new BusinessException(404, "User not found"));

        // Verify old password
        if (!passwordEncoder.matches(request.getOldPassword(), userAccount.getPasswordHash())) {
            throw new BusinessException(400, "Old password is incorrect");
        }

        // Check if new password is same as old password
        if (passwordEncoder.matches(request.getNewPassword(), userAccount.getPasswordHash())) {
            throw new BusinessException(400, "New password must be different from old password");
        }

        // Update password
        userAccount.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userAccountRepository.save(userAccount);
    }
}
