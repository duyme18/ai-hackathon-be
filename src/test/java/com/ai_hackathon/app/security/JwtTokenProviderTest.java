package com.ai_hackathon.app.security;

import com.ai_hackathon.app.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.UserDetails;

import static org.assertj.core.api.Assertions.assertThat;

class JwtTokenProviderTest {

    private static final String SECRET = "test-secret-key-at-least-32-characters-long!!";
    private static final long EXPIRY_MS = 3_600_000L; // 1 hour

    private JwtTokenProvider jwtTokenProvider;

    @BeforeEach
    void setUp() {
        jwtTokenProvider = new JwtTokenProvider(SECRET, EXPIRY_MS);
    }

    @Test
    void generateToken_returnsNonNullToken() {
        UserDetails user = buildUser("alice@example.com");
        String token = jwtTokenProvider.generateToken(user);
        assertThat(token).isNotBlank();
    }

    @Test
    void extractUsername_returnsEmailFromToken() {
        UserDetails user = buildUser("alice@example.com");
        String token = jwtTokenProvider.generateToken(user);
        assertThat(jwtTokenProvider.extractUsername(token)).isEqualTo("alice@example.com");
    }

    @Test
    void validateToken_withValidToken_returnsTrue() {
        UserDetails user = buildUser("bob@example.com");
        String token = jwtTokenProvider.generateToken(user);
        assertThat(jwtTokenProvider.validateToken(token)).isTrue();
    }

    @Test
    void validateToken_withUserDetails_matchingUser_returnsTrue() {
        UserDetails user = buildUser("carol@example.com");
        String token = jwtTokenProvider.generateToken(user);
        assertThat(jwtTokenProvider.validateToken(token, user)).isTrue();
    }

    @Test
    void validateToken_withUserDetails_wrongUser_returnsFalse() {
        UserDetails alice = buildUser("alice@example.com");
        UserDetails bob = buildUser("bob@example.com");
        String aliceToken = jwtTokenProvider.generateToken(alice);
        assertThat(jwtTokenProvider.validateToken(aliceToken, bob)).isFalse();
    }

    @Test
    void validateToken_tamperedToken_returnsFalse() {
        UserDetails user = buildUser("alice@example.com");
        String token = jwtTokenProvider.generateToken(user);
        String tampered = token.substring(0, token.length() - 5) + "XXXXX";
        assertThat(jwtTokenProvider.validateToken(tampered)).isFalse();
    }

    @Test
    void validateToken_expiredToken_returnsFalse() {
        JwtTokenProvider shortLivedProvider = new JwtTokenProvider(SECRET, 1L); // 1 ms
        UserDetails user = buildUser("dave@example.com");
        String token = shortLivedProvider.generateToken(user);

        // Wait for expiry
        try { Thread.sleep(10); } catch (InterruptedException ignored) {}

        assertThat(shortLivedProvider.validateToken(token)).isFalse();
    }

    @Test
    void validateToken_blankToken_returnsFalse() {
        assertThat(jwtTokenProvider.validateToken("")).isFalse();
    }

    private User buildUser(String email) {
        return User.builder().email(email).password("hashed").name("Test").build();
    }
}
