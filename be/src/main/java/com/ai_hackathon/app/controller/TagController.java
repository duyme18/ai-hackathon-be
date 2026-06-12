package com.ai_hackathon.app.controller;

import com.ai_hackathon.app.dto.request.SpecFileRequest;
import com.ai_hackathon.app.dto.request.TagRequest;
import com.ai_hackathon.app.dto.response.ApiResponse;
import com.ai_hackathon.app.dto.response.SpecFileResponse;
import com.ai_hackathon.app.dto.response.TagResponse;
import com.ai_hackathon.app.service.SpecFileService;
import com.ai_hackathon.app.service.TagService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tags")
@RequiredArgsConstructor
@Tag(name = "Tags")
public class TagController {

    private final TagService tagService;
    private final SpecFileService specFileService;

    @GetMapping("/{id}")
    @Operation(summary = "Get tag by id")
    public ResponseEntity<ApiResponse<TagResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(tagService.getById(id)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update tag")
    public ResponseEntity<ApiResponse<TagResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody TagRequest request) {
        return ResponseEntity.ok(ApiResponse.success(tagService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete tag")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        tagService.delete(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    // --- Spec files nested under tag ---

    @GetMapping("/{tagId}/spec-files")
    @Operation(summary = "List spec files in tag")
    public ResponseEntity<ApiResponse<List<SpecFileResponse>>> getSpecFiles(@PathVariable Long tagId) {
        return ResponseEntity.ok(ApiResponse.success(specFileService.getByTag(tagId)));
    }

    @PostMapping("/{tagId}/spec-files")
    @Operation(summary = "Create spec file in tag")
    public ResponseEntity<ApiResponse<SpecFileResponse>> createSpecFile(
            @PathVariable Long tagId,
            @Valid @RequestBody SpecFileRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(specFileService.create(tagId, request)));
    }
}
