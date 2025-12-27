package com.secondhand.platform.security;

import org.bouncycastle.crypto.generators.Argon2BytesGenerator;
import org.bouncycastle.crypto.params.Argon2Parameters;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.security.SecureRandom;
import java.util.Base64;

@Component
public class Argon2PasswordEncoder implements PasswordEncoder {

    private static final int SALT_LENGTH = 16;
    private static final int HASH_LENGTH = 32;
    private static final int PARALLELISM = 1;
    private static final int MEMORY = 65536; // 64 MB
    private static final int ITERATIONS = 3;

    private final SecureRandom secureRandom = new SecureRandom();

    @Override
    public String encode(CharSequence rawPassword) {
        byte[] salt = new byte[SALT_LENGTH];
        secureRandom.nextBytes(salt);

        byte[] hash = generateHash(rawPassword.toString().toCharArray(), salt);

        String saltBase64 = Base64.getEncoder().encodeToString(salt);
        String hashBase64 = Base64.getEncoder().encodeToString(hash);

        return String.format("$argon2id$v=19$m=%d,t=%d,p=%d$%s$%s",
                MEMORY, ITERATIONS, PARALLELISM, saltBase64, hashBase64);
    }

    @Override
    public boolean matches(CharSequence rawPassword, String encodedPassword) {
        try {
            String[] parts = encodedPassword.split("\\$");
            if (parts.length != 6) {
                return false;
            }

            String[] params = parts[3].split(",");
            int memory = Integer.parseInt(params[0].substring(2));
            int iterations = Integer.parseInt(params[1].substring(2));
            int parallelism = Integer.parseInt(params[2].substring(2));

            byte[] salt = Base64.getDecoder().decode(parts[4]);
            byte[] expectedHash = Base64.getDecoder().decode(parts[5]);

            byte[] actualHash = generateHash(rawPassword.toString().toCharArray(), salt, memory, iterations, parallelism);

            return constantTimeEquals(expectedHash, actualHash);
        } catch (Exception e) {
            return false;
        }
    }

    private byte[] generateHash(char[] password, byte[] salt) {
        return generateHash(password, salt, MEMORY, ITERATIONS, PARALLELISM);
    }

    private byte[] generateHash(char[] password, byte[] salt, int memory, int iterations, int parallelism) {
        Argon2Parameters.Builder builder = new Argon2Parameters.Builder(Argon2Parameters.ARGON2_id)
                .withVersion(Argon2Parameters.ARGON2_VERSION_13)
                .withIterations(iterations)
                .withMemoryAsKB(memory)
                .withParallelism(parallelism)
                .withSalt(salt);

        Argon2BytesGenerator generator = new Argon2BytesGenerator();
        generator.init(builder.build());

        byte[] hash = new byte[HASH_LENGTH];
        generator.generateBytes(password, hash);

        return hash;
    }

    private boolean constantTimeEquals(byte[] a, byte[] b) {
        if (a.length != b.length) {
            return false;
        }
        int result = 0;
        for (int i = 0; i < a.length; i++) {
            result |= a[i] ^ b[i];
        }
        return result == 0;
    }
}
