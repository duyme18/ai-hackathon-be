package com.ai_hackathon.app.controller;

import com.ai_hackathon.app.dto.request.ProjectRequest;
import com.ai_hackathon.app.dto.request.TaskRequest;
import com.ai_hackathon.app.dto.response.ApiResponse;
import com.ai_hackathon.app.dto.response.ProjectResponse;
import com.ai_hackathon.app.dto.response.TaskResponse;
import com.ai_hackathon.app.service.ProjectService;
import com.ai_hackathon.app.service.TaskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/projects")
@RequiredArgsConstructor
@Tag(name = "Projects")
public class ProjectController {

    private final ProjectService projectService;
    private final TaskService taskService;

    @GetMapping
    @Operation(summary = "List all projects")
    public ResponseEntity<ApiResponse<List<ProjectResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(projectService.getAll()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get project by id")
    public ResponseEntity<ApiResponse<ProjectResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(projectService.getById(id)));
    }

    @PostMapping
    @Operation(summary = "Create project")
    public ResponseEntity<ApiResponse<ProjectResponse>> create(@Valid @RequestBody ProjectRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(projectService.create(request)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update project")
    public ResponseEntity<ApiResponse<ProjectResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody ProjectRequest request) {
        return ResponseEntity.ok(ApiResponse.success(projectService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete project")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        projectService.delete(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    // --- Tasks nested under project ---

    @GetMapping("/{projectId}/tasks")
    @Operation(summary = "List tasks in project")
    public ResponseEntity<ApiResponse<List<TaskResponse>>> getTasks(@PathVariable Long projectId) {
        return ResponseEntity.ok(ApiResponse.success(taskService.getByProject(projectId)));
    }

    @PostMapping("/{projectId}/tasks")
    @Operation(summary = "Create task in project")
    public ResponseEntity<ApiResponse<TaskResponse>> createTask(
            @PathVariable Long projectId,
            @Valid @RequestBody TaskRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(taskService.create(projectId, request)));
    }
}
