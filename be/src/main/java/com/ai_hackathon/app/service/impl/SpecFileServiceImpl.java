package com.ai_hackathon.app.service.impl;

import com.ai_hackathon.app.dto.request.SpecFileRequest;
import com.ai_hackathon.app.dto.response.SpecFileResponse;
import com.ai_hackathon.app.entity.SpecFile;
import com.ai_hackathon.app.entity.Tag;
import com.ai_hackathon.app.entity.enums.SpecFileStatus;
import com.ai_hackathon.app.exception.AppException;
import com.ai_hackathon.app.exception.ErrorCode;
import com.ai_hackathon.app.repository.SpecFileRepository;
import com.ai_hackathon.app.repository.TagRepository;
import com.ai_hackathon.app.service.SpecFileService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SpecFileServiceImpl implements SpecFileService {

    private final SpecFileRepository specFileRepository;
    private final TagRepository tagRepository;

    @Override
    public List<SpecFileResponse> getByTag(Long tagId) {
        if (!tagRepository.existsById(tagId)) {
            throw new AppException(ErrorCode.TAG_NOT_FOUND);
        }
        return specFileRepository.findByTagId(tagId).stream()
                .map(SpecFileResponse::from)
                .toList();
    }

    @Override
    public SpecFileResponse getById(Long id) {
        return SpecFileResponse.from(findOrThrow(id));
    }

    @Override
    @Transactional
    public SpecFileResponse create(Long tagId, SpecFileRequest request) {
        Tag tag = tagRepository.findById(tagId)
                .orElseThrow(() -> new AppException(ErrorCode.TAG_NOT_FOUND));
        SpecFile specFile = SpecFile.builder()
                .name(request.getName())
                .status(request.getStatus() != null ? request.getStatus() : SpecFileStatus.DRAFT)
                .fileUrl(request.getFileUrl())
                .fileName(request.getFileName())
                .fileType(request.getFileType())
                .fileSize(request.getFileSize())
                .tag(tag)
                .build();
        return SpecFileResponse.from(specFileRepository.save(specFile));
    }

    @Override
    @Transactional
    public SpecFileResponse update(Long id, SpecFileRequest request) {
        SpecFile specFile = findOrThrow(id);
        specFile.setName(request.getName());
        if (request.getStatus() != null) specFile.setStatus(request.getStatus());
        specFile.setFileUrl(request.getFileUrl());
        specFile.setFileName(request.getFileName());
        specFile.setFileType(request.getFileType());
        specFile.setFileSize(request.getFileSize());
        return SpecFileResponse.from(specFileRepository.save(specFile));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!specFileRepository.existsById(id)) {
            throw new AppException(ErrorCode.SPEC_FILE_NOT_FOUND);
        }
        specFileRepository.deleteById(id);
    }

    private SpecFile findOrThrow(Long id) {
        return specFileRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.SPEC_FILE_NOT_FOUND));
    }
}
