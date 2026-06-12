package com.ai_hackathon.app.dto.response;

import com.ai_hackathon.app.entity.Project;
import com.ai_hackathon.app.entity.enums.ProjectStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ProjectResponse {

    private Long id;
    private String name;
    private String description;
    private ProjectStatus status;
    private int taskCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static ProjectResponse from(Project p) {
        return ProjectResponse.builder()
                .id(p.getId())
                .name(p.getName())
                .description(p.getDescription())
                .status(p.getStatus())
                .taskCount(p.getTasks().size())
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .build();
    }
}
