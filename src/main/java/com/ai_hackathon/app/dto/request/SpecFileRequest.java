package com.ai_hackathon.app.dto.request;

import com.ai_hackathon.app.entity.enums.SpecFileStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter
public class SpecFileRequest {

    @NotBlank(message = "Spec file name is required")
    private String name;

    private SpecFileStatus status;

    private String fileUrl;

    private String fileName;

    private String fileType;

    private Long fileSize;
}
