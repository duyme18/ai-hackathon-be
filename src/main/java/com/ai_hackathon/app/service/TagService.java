package com.ai_hackathon.app.service;

import com.ai_hackathon.app.dto.request.TagRequest;
import com.ai_hackathon.app.dto.response.TagResponse;

import java.util.List;

public interface TagService {

    List<TagResponse> getByTask(Long taskId);

    TagResponse getById(Long id);

    TagResponse create(Long taskId, TagRequest request);

    TagResponse update(Long id, TagRequest request);

    void delete(Long id);
}
