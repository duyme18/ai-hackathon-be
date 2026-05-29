package com.ai_hackathon.app.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {

    // Auth
    INVALID_CREDENTIALS(HttpStatus.UNAUTHORIZED, "Invalid email or password"),
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "Authentication required"),
    EMAIL_ALREADY_EXISTS(HttpStatus.CONFLICT, "Email already exists"),

    // Resource
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "User not found"),

    // Generic
    BAD_REQUEST(HttpStatus.BAD_REQUEST, "Bad request"),
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "Internal server error");

    private final HttpStatus httpStatus;
    private final String message;

    ErrorCode(HttpStatus httpStatus, String message) {
        this.httpStatus = httpStatus;
        this.message = message;
    }
}
