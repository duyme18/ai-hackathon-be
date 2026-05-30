package com.ai_hackathon.app.dto.response;

import com.ai_hackathon.app.entity.Task;
import com.ai_hackathon.app.entity.enums.TaskPriority;
import com.ai_hackathon.app.entity.enums.TaskStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Builder
public class TaskResponse {

    private Long id;
    private String title;
    private String description;
    private TaskStatus status;
    private TaskPriority priority;
    private LocalDate dueDate;
    private Long projectId;
    private int tagCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static TaskResponse from(Task t) {
        return TaskResponse.builder()
                .id(t.getId())
                .title(t.getTitle())
                .description(t.getDescription())
                .status(t.getStatus())
                .priority(t.getPriority())
                .dueDate(t.getDueDate())
                .projectId(t.getProject().getId())
                .tagCount(t.getTags().size())
                .createdAt(t.getCreatedAt())
                .updatedAt(t.getUpdatedAt())
                .build();
    }
}
