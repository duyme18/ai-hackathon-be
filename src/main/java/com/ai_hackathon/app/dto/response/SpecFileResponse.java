package com.ai_hackathon.app.dto.response;

import com.ai_hackathon.app.entity.SpecFile;
import com.ai_hackathon.app.entity.enums.SpecFileStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class SpecFileResponse {

    private Long id;
    private String name;
    private SpecFileStatus status;
    private String fileUrl;
    private String fileName;
    private String fileType;
    private Long fileSize;
    private Long tagId;
    private int chatMessageCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static SpecFileResponse from(SpecFile sf) {
        return SpecFileResponse.builder()
                .id(sf.getId())
                .name(sf.getName())
                .status(sf.getStatus())
                .fileUrl(sf.getFileUrl())
                .fileName(sf.getFileName())
                .fileType(sf.getFileType())
                .fileSize(sf.getFileSize())
                .tagId(sf.getTag().getId())
                .chatMessageCount(sf.getChatMessages().size())
                .createdAt(sf.getCreatedAt())
                .updatedAt(sf.getUpdatedAt())
                .build();
    }
}
