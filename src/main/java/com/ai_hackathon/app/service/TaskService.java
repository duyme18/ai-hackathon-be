package com.ai_hackathon.app.service;

import com.ai_hackathon.app.dto.request.TaskRequest;
import com.ai_hackathon.app.dto.response.TaskResponse;

import java.util.List;

public interface TaskService {

    List<TaskResponse> getByProject(Long projectId);

    TaskResponse getById(Long id);

    TaskResponse create(Long projectId, TaskRequest request);

    TaskResponse update(Long id, TaskRequest request);

    void delete(Long id);
}
