package com.secondhand.platform.security;

import org.springframework.security.crypto.argon2.Argon2PasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class CustomArgon2PasswordEncoder implements PasswordEncoder {

    private final Argon2PasswordEncoder delegate;

    public CustomArgon2PasswordEncoder() {
        // saltLength, hashLength, parallelism, memory (KB), iterations
        this.delegate = new Argon2PasswordEncoder(16, 32, 1, 65536, 3);
    }

    @Override
    public String encode(CharSequence rawPassword) {
        return delegate.encode(rawPassword);
    }

    @Override
    public boolean matches(CharSequence rawPassword, String encodedPassword) {
        return delegate.matches(rawPassword, encodedPassword);
    }
}
