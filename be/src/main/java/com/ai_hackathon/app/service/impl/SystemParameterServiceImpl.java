package com.ai_hackathon.app.service.impl;

import com.ai_hackathon.app.dto.request.SystemParameterRequest;
import com.ai_hackathon.app.dto.response.SystemParameterInUseResponse;
import com.ai_hackathon.app.dto.response.SystemParameterResponse;
import com.ai_hackathon.app.entity.SystemParameter;
import com.ai_hackathon.app.exception.AppException;
import com.ai_hackathon.app.exception.ErrorCode;
import com.ai_hackathon.app.repository.SystemParameterRepository;
import com.ai_hackathon.app.service.SystemParameterService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SystemParameterServiceImpl implements SystemParameterService {

    private final SystemParameterRepository repository;

    @Override
    public Page<SystemParameterResponse> getAll(String keyword, Pageable pageable) {
        return repository.findByKeyword(keyword, pageable)
                .map(SystemParameterResponse::from);
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
        SystemParameter parameter = SystemParameter.builder()
                .name(request.getName())
                .key(request.getKey())
                .value(request.getValue())
                .description(request.getDescription())
                .build();
        return SystemParameterResponse.from(repository.save(parameter));
    }

    @Override
    @Transactional
    public SystemParameterResponse update(Long id, SystemParameterRequest request) {
        SystemParameter parameter = findOrThrow(id);
        if (repository.isInUse(id)) {
            throw new AppException(ErrorCode.SYSTEM_PARAMETER_IN_USE);
        }
        parameter.setName(request.getName());
        parameter.setKey(request.getKey());
        parameter.setValue(request.getValue());
        parameter.setDescription(request.getDescription());
        return SystemParameterResponse.from(repository.save(parameter));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        findOrThrow(id);
        if (repository.isInUse(id)) {
            throw new AppException(ErrorCode.SYSTEM_PARAMETER_IN_USE);
        }
        repository.deleteById(id);
    }

    @Override
    public SystemParameterInUseResponse isInUse(Long id) {
        findOrThrow(id);
        return new SystemParameterInUseResponse(repository.isInUse(id));
    }

    private SystemParameter findOrThrow(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.SYSTEM_PARAMETER_NOT_FOUND));
    }
}
