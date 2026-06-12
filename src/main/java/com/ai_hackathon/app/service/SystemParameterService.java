package com.ai_hackathon.app.service;

import com.ai_hackathon.app.dto.request.SystemParameterRequest;
import com.ai_hackathon.app.dto.response.PageResponse;
import com.ai_hackathon.app.dto.response.SystemParameterInUseResponse;
import com.ai_hackathon.app.dto.response.SystemParameterResponse;

public interface SystemParameterService {

    PageResponse<SystemParameterResponse> getAll(String keyword, int page, int size);

    SystemParameterResponse getById(Long id);

    SystemParameterResponse create(SystemParameterRequest request);

    SystemParameterResponse update(Long id, SystemParameterRequest request);

    void delete(Long id);

    SystemParameterInUseResponse checkInUse(Long id);
}
