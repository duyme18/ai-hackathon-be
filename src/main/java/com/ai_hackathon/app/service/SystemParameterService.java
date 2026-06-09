package com.ai_hackathon.app.service;

import com.ai_hackathon.app.dto.request.SystemParameterRequest;
import com.ai_hackathon.app.dto.response.SystemParameterInUseResponse;
import com.ai_hackathon.app.dto.response.SystemParameterResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface SystemParameterService {

    Page<SystemParameterResponse> getAll(String keyword, Pageable pageable);

    SystemParameterResponse getById(Long id);

    SystemParameterResponse create(SystemParameterRequest request);

    SystemParameterResponse update(Long id, SystemParameterRequest request);

    void delete(Long id);

    SystemParameterInUseResponse isInUse(Long id);
}
