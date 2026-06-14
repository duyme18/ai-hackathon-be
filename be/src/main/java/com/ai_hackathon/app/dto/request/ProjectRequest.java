package com.ai_hackathon.app.dto.request;

import com.ai_hackathon.app.entity.enums.ProjectStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter
public class ProjectRequest {

    @NotBlank(message = "Project name is required")
    private String name;

    private String description;

    private ProjectStatus status;
}
