package com.ai_hackathon.app.service;

import com.ai_hackathon.app.dto.request.ProjectRequest;
import com.ai_hackathon.app.dto.response.ProjectResponse;

import java.util.List;

public interface ProjectService {

    List<ProjectResponse> getAll();

    ProjectResponse getById(Long id);

    ProjectResponse create(ProjectRequest request);

    ProjectResponse update(Long id, ProjectRequest request);

    void delete(Long id);
}
