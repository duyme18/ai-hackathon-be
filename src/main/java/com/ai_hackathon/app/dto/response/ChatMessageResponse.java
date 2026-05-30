package com.ai_hackathon.app.dto.response;

import com.ai_hackathon.app.entity.ChatMessage;
import com.ai_hackathon.app.entity.enums.ChatRole;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ChatMessageResponse {

    private Long id;
    private String content;
    private ChatRole role;
    private Long specFileId;
    private LocalDateTime createdAt;

    public static ChatMessageResponse from(ChatMessage m) {
        return ChatMessageResponse.builder()
                .id(m.getId())
                .content(m.getContent())
                .role(m.getRole())
                .specFileId(m.getSpecFile().getId())
                .createdAt(m.getCreatedAt())
                .build();
    }
}
