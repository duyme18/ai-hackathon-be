package com.ai_hackathon.app.controller;

import com.ai_hackathon.app.dto.request.TagRequest;
import com.ai_hackathon.app.dto.request.TaskRequest;
import com.ai_hackathon.app.dto.response.ApiResponse;
import com.ai_hackathon.app.dto.response.TagResponse;
import com.ai_hackathon.app.dto.response.TaskResponse;
import com.ai_hackathon.app.service.TagService;
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
@RequestMapping("/api/v1/tasks")
@RequiredArgsConstructor
@Tag(name = "Tasks")
public class TaskController {

    private final TaskService taskService;
    private final TagService tagService;

    @GetMapping("/{id}")
    @Operation(summary = "Get task by id")
    public ResponseEntity<ApiResponse<TaskResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(taskService.getById(id)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update task")
    public ResponseEntity<ApiResponse<TaskResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody TaskRequest request) {
        return ResponseEntity.ok(ApiResponse.success(taskService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete task")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        taskService.delete(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    // --- Tags nested under task ---

    @GetMapping("/{taskId}/tags")
    @Operation(summary = "List tags in task")
    public ResponseEntity<ApiResponse<List<TagResponse>>> getTags(@PathVariable Long taskId) {
        return ResponseEntity.ok(ApiResponse.success(tagService.getByTask(taskId)));
    }

    @PostMapping("/{taskId}/tags")
    @Operation(summary = "Create tag in task")
    public ResponseEntity<ApiResponse<TagResponse>> createTag(
            @PathVariable Long taskId,
            @Valid @RequestBody TagRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(tagService.create(taskId, request)));
    }
}
