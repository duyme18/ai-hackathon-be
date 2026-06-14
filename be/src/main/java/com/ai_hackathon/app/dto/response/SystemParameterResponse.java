package com.ai_hackathon.app.dto.response;

import com.ai_hackathon.app.entity.SystemParameter;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class SystemParameterResponse {

    private Long id;
    private String name;
    private String key;
    private String value;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static SystemParameterResponse from(SystemParameter p) {
        return SystemParameterResponse.builder()
                .id(p.getId())
                .name(p.getName())
                .key(p.getKey())
                .value(p.getValue())
                .description(p.getDescription())
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .build();
    }
}
