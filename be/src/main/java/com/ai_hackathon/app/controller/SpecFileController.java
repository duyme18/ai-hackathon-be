package com.ai_hackathon.app.controller;

import com.ai_hackathon.app.dto.request.ChatMessageRequest;
import com.ai_hackathon.app.dto.request.SpecFileRequest;
import com.ai_hackathon.app.dto.response.ApiResponse;
import com.ai_hackathon.app.dto.response.ChatMessageResponse;
import com.ai_hackathon.app.dto.response.SpecFileResponse;
import com.ai_hackathon.app.service.ChatHistoryService;
import com.ai_hackathon.app.service.SpecFileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/spec-files")
@RequiredArgsConstructor
@Tag(name = "SpecFiles")
public class SpecFileController {

    private final SpecFileService specFileService;
    private final ChatHistoryService chatHistoryService;

    @GetMapping("/{id}")
    @Operation(summary = "Get spec file by id")
    public ResponseEntity<ApiResponse<SpecFileResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(specFileService.getById(id)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update spec file")
    public ResponseEntity<ApiResponse<SpecFileResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody SpecFileRequest request) {
        return ResponseEntity.ok(ApiResponse.success(specFileService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete spec file")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        specFileService.delete(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    // --- Chat history nested under spec file ---

    @GetMapping("/{specFileId}/chat")
    @Operation(summary = "Get chat history for spec file")
    public ResponseEntity<ApiResponse<List<ChatMessageResponse>>> getChat(@PathVariable Long specFileId) {
        return ResponseEntity.ok(ApiResponse.success(chatHistoryService.getBySpecFile(specFileId)));
    }

    @PostMapping("/{specFileId}/chat")
    @Operation(summary = "Add chat message to spec file")
    public ResponseEntity<ApiResponse<ChatMessageResponse>> addChat(
            @PathVariable Long specFileId,
            @Valid @RequestBody ChatMessageRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(chatHistoryService.create(specFileId, request)));
    }
}
