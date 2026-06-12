package com.ai_hackathon.app.service;

import com.ai_hackathon.app.dto.request.LoginRequest;
import com.ai_hackathon.app.dto.request.RegisterRequest;
import com.ai_hackathon.app.dto.response.AuthResponse;
import com.ai_hackathon.app.entity.User;
import com.ai_hackathon.app.exception.AppException;
import com.ai_hackathon.app.exception.ErrorCode;
import com.ai_hackathon.app.repository.UserRepository;
import com.ai_hackathon.app.security.JwtTokenProvider;
import com.ai_hackathon.app.service.impl.AuthServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @InjectMocks
    private AuthServiceImpl authService;

    @Test
    void register_success() {
        RegisterRequest request = mockRegisterRequest("test@example.com", "password123", "Test User");

        when(userRepository.existsByEmail("test@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("$2a$hashed");
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));
        when(jwtTokenProvider.generateToken(any())).thenReturn("jwt-token");

        AuthResponse response = authService.register(request);

        assertThat(response.getAccessToken()).isEqualTo("jwt-token");
        assertThat(response.getTokenType()).isEqualTo("Bearer");
        verify(userRepository).save(any(User.class));
    }

    @Test
    void register_duplicateEmail_throwsEmailAlreadyExists() {
        RegisterRequest request = mockRegisterRequest("dup@example.com", "password123", "User");
        when(userRepository.existsByEmail("dup@example.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(AppException.class)
                .satisfies(ex -> assertThat(((AppException) ex).getErrorCode())
                        .isEqualTo(ErrorCode.EMAIL_ALREADY_EXISTS));

        verify(userRepository, never()).save(any());
    }

    @Test
    void login_success() {
        LoginRequest request = mockLoginRequest("user@example.com", "password123");
        User user = User.builder()
                .email("user@example.com")
                .password("$2a$hashed")
                .name("User")
                .build();

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password123", "$2a$hashed")).thenReturn(true);
        when(jwtTokenProvider.generateToken(user)).thenReturn("jwt-token");

        AuthResponse response = authService.login(request);

        assertThat(response.getAccessToken()).isEqualTo("jwt-token");
    }

    @Test
    void login_userNotFound_throwsInvalidCredentials() {
        LoginRequest request = mockLoginRequest("nobody@example.com", "pass");
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(AppException.class)
                .satisfies(ex -> assertThat(((AppException) ex).getErrorCode())
                        .isEqualTo(ErrorCode.INVALID_CREDENTIALS));
    }

    @Test
    void login_wrongPassword_throwsInvalidCredentials() {
        LoginRequest request = mockLoginRequest("user@example.com", "wrongpass");
        User user = User.builder()
                .email("user@example.com")
                .password("$2a$hashed")
                .name("User")
                .build();

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrongpass", "$2a$hashed")).thenReturn(false);

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(AppException.class)
                .satisfies(ex -> assertThat(((AppException) ex).getErrorCode())
                        .isEqualTo(ErrorCode.INVALID_CREDENTIALS));
    }

    private RegisterRequest mockRegisterRequest(String email, String password, String name) {
        RegisterRequest req = mock(RegisterRequest.class);
        when(req.getEmail()).thenReturn(email);
        when(req.getPassword()).thenReturn(password);
        when(req.getName()).thenReturn(name);
        return req;
    }

    private LoginRequest mockLoginRequest(String email, String password) {
        LoginRequest req = mock(LoginRequest.class);
        when(req.getEmail()).thenReturn(email);
        when(req.getPassword()).thenReturn(password);
        return req;
    }
}
