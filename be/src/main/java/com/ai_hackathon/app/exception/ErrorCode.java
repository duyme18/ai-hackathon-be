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

    // Domain
    PROJECT_NOT_FOUND(HttpStatus.NOT_FOUND, "Project not found"),
    TASK_NOT_FOUND(HttpStatus.NOT_FOUND, "Task not found"),
    TAG_NOT_FOUND(HttpStatus.NOT_FOUND, "Tag not found"),
    SPEC_FILE_NOT_FOUND(HttpStatus.NOT_FOUND, "Spec file not found"),
    CHAT_MESSAGE_NOT_FOUND(HttpStatus.NOT_FOUND, "Chat message not found"),

    // System Parameters
    SYSTEM_PARAMETER_NOT_FOUND(HttpStatus.NOT_FOUND, "System parameter not found"),
    SYSTEM_PARAMETER_KEY_EXISTS(HttpStatus.CONFLICT, "System parameter key already exists"),
    SYSTEM_PARAMETER_IN_USE(HttpStatus.CONFLICT, "System parameter is in use and cannot be modified"),

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
