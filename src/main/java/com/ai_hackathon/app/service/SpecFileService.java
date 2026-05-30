package com.ai_hackathon.app.service;

import com.ai_hackathon.app.dto.request.SpecFileRequest;
import com.ai_hackathon.app.dto.response.SpecFileResponse;

import java.util.List;

public interface SpecFileService {

    List<SpecFileResponse> getByTag(Long tagId);

    SpecFileResponse getById(Long id);

    SpecFileResponse create(Long tagId, SpecFileRequest request);

    SpecFileResponse update(Long id, SpecFileRequest request);

    void delete(Long id);
}
