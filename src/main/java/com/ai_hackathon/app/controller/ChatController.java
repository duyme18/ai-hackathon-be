package com.ai_hackathon.app.controller;

import com.ai_hackathon.app.dto.response.ApiResponse;
import com.ai_hackathon.app.dto.response.ChatMessageResponse;
import com.ai_hackathon.app.service.ChatHistoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/chat")
@RequiredArgsConstructor
@Tag(name = "Chat")
public class ChatController {

    private final ChatHistoryService chatHistoryService;

    @GetMapping("/{id}")
    @Operation(summary = "Get chat message by id")
    public ResponseEntity<ApiResponse<ChatMessageResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(chatHistoryService.getById(id)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete chat message")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        chatHistoryService.delete(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
