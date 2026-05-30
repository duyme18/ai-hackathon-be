package com.ai_hackathon.app.dto.request;

import com.ai_hackathon.app.entity.enums.TaskPriority;
import com.ai_hackathon.app.entity.enums.TaskStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

import java.time.LocalDate;

@Getter
public class TaskRequest {

    @NotBlank(message = "Task title is required")
    private String title;

    private String description;

    private TaskStatus status;

    private TaskPriority priority;

    private LocalDate dueDate;
}
