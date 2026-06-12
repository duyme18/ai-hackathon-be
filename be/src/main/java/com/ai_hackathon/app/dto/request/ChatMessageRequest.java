package com.ai_hackathon.app.dto.request;

import com.ai_hackathon.app.entity.enums.ChatRole;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

@Getter
public class ChatMessageRequest {

    @NotBlank(message = "Message content is required")
    private String content;

    @NotNull(message = "Role is required")
    private ChatRole role;
}
