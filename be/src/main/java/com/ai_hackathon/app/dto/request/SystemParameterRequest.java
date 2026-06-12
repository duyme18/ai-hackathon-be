package com.ai_hackathon.app.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;

@Getter
public class SystemParameterRequest {

    @NotBlank(message = "Key is required")
    @Pattern(regexp = "^[A-Z0-9_]+$", message = "Key must contain only uppercase letters, digits, and underscores")
    @Size(max = 20, message = "Key must not exceed 20 characters")
    private String key;

    @NotBlank(message = "Value is required")
    private String value;

    private String description;
}
