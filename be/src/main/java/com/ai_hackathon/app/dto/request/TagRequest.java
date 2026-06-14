package com.ai_hackathon.app.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter
public class TagRequest {

    @NotBlank(message = "Tag name is required")
    private String name;

    private String color;
}
