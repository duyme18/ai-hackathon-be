package com.ai_hackathon.app.dto.response;

import com.ai_hackathon.app.entity.Tag;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class TagResponse {

    private Long id;
    private String name;
    private String color;
    private Long taskId;
    private int specFileCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static TagResponse from(Tag t) {
        return TagResponse.builder()
                .id(t.getId())
                .name(t.getName())
                .color(t.getColor())
                .taskId(t.getTask().getId())
                .specFileCount(t.getSpecFiles().size())
                .createdAt(t.getCreatedAt())
                .updatedAt(t.getUpdatedAt())
                .build();
    }
}
