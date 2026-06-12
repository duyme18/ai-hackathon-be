package com.ai_hackathon.app.service;

import com.ai_hackathon.app.dto.request.ChatMessageRequest;
import com.ai_hackathon.app.dto.response.ChatMessageResponse;

import java.util.List;

public interface ChatHistoryService {

    List<ChatMessageResponse> getBySpecFile(Long specFileId);

    ChatMessageResponse getById(Long id);

    ChatMessageResponse create(Long specFileId, ChatMessageRequest request);

    void delete(Long id);
}
