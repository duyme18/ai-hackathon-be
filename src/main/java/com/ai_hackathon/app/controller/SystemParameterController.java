package com.ai_hackathon.app.controller;

import com.ai_hackathon.app.dto.request.SystemParameterRequest;
import com.ai_hackathon.app.dto.response.ApiResponse;
import com.ai_hackathon.app.dto.response.PageResponse;
import com.ai_hackathon.app.dto.response.SystemParameterInUseResponse;
import com.ai_hackathon.app.dto.response.SystemParameterResponse;
import com.ai_hackathon.app.service.SystemParameterService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/system-parameters")
@RequiredArgsConstructor
@Tag(name = "System Parameters")
public class SystemParameterController {

    private final SystemParameterService systemParameterService;

    @GetMapping
    @Operation(summary = "List system parameters with optional search and pagination")
    public ResponseEntity<ApiResponse<PageResponse<SystemParameterResponse>>> getAll(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success(systemParameterService.getAll(keyword, page, size)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get system parameter by id")
    public ResponseEntity<ApiResponse<SystemParameterResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(systemParameterService.getById(id)));
    }

    @PostMapping
    @Operation(summary = "Create system parameter")
    public ResponseEntity<ApiResponse<SystemParameterResponse>> create(
            @Valid @RequestBody SystemParameterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(systemParameterService.create(request)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update system parameter")
    public ResponseEntity<ApiResponse<SystemParameterResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody SystemParameterRequest request) {
        return ResponseEntity.ok(ApiResponse.success(systemParameterService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete system parameter")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        systemParameterService.delete(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @GetMapping("/{id}/in-use")
    @Operation(summary = "Check if system parameter is in use")
    public ResponseEntity<ApiResponse<SystemParameterInUseResponse>> checkInUse(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(systemParameterService.checkInUse(id)));
    }
}
