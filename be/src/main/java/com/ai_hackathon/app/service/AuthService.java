package com.ai_hackathon.app.service;

import com.ai_hackathon.app.dto.request.LoginRequest;
import com.ai_hackathon.app.dto.request.RegisterRequest;
import com.ai_hackathon.app.dto.response.AuthResponse;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);
}
