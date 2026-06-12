package com.ai_hackathon.app.service.impl;

import com.ai_hackathon.app.dto.request.SystemParameterRequest;
import com.ai_hackathon.app.dto.response.PageResponse;
import com.ai_hackathon.app.dto.response.SystemParameterInUseResponse;
import com.ai_hackathon.app.dto.response.SystemParameterResponse;
import com.ai_hackathon.app.entity.SystemParameter;
import com.ai_hackathon.app.exception.AppException;
import com.ai_hackathon.app.exception.ErrorCode;
import com.ai_hackathon.app.repository.SystemParameterRepository;
import com.ai_hackathon.app.service.SystemParameterService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SystemParameterServiceImpl implements SystemParameterService {

    private final SystemParameterRepository repository;

    @Override
    public PageResponse<SystemParameterResponse> getAll(String keyword, int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return PageResponse.from(
                repository.findByKeyword(keyword, pageable).map(SystemParameterResponse::from)
        );
    }

    @Override
    public SystemParameterResponse getById(Long id) {
        return SystemParameterResponse.from(findOrThrow(id));
    }

    @Override
    @Transactional
    public SystemParameterResponse create(SystemParameterRequest request) {
        if (repository.existsByKeyIgnoreCase(request.getKey())) {
            throw new AppException(ErrorCode.SYSTEM_PARAMETER_KEY_EXISTS);
        }
        SystemParameter param = SystemParameter.builder()
                .key(request.getKey())
                .value(request.getValue())
                .description(request.getDescription())
                .build();
        return SystemParameterResponse.from(repository.save(param));
    }

    @Override
    @Transactional
    public SystemParameterResponse update(Long id, SystemParameterRequest request) {
        SystemParameter param = findOrThrow(id);
        if (repository.isInUse(id)) {
            throw new AppException(ErrorCode.SYSTEM_PARAMETER_IN_USE);
        }
        if (!param.getKey().equalsIgnoreCase(request.getKey())
                && repository.existsByKeyIgnoreCase(request.getKey())) {
            throw new AppException(ErrorCode.SYSTEM_PARAMETER_KEY_EXISTS);
        }
        param.setKey(request.getKey());
        param.setValue(request.getValue());
        param.setDescription(request.getDescription());
        return SystemParameterResponse.from(repository.save(param));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new AppException(ErrorCode.SYSTEM_PARAMETER_NOT_FOUND);
        }
        if (repository.isInUse(id)) {
            throw new AppException(ErrorCode.SYSTEM_PARAMETER_IN_USE);
        }
        repository.deleteById(id);
    }

    @Override
    public SystemParameterInUseResponse checkInUse(Long id) {
        if (!repository.existsById(id)) {
            throw new AppException(ErrorCode.SYSTEM_PARAMETER_NOT_FOUND);
        }
        return new SystemParameterInUseResponse(repository.isInUse(id));
    }

    private SystemParameter findOrThrow(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.SYSTEM_PARAMETER_NOT_FOUND));
    }
}
