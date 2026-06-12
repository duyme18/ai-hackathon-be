package com.ai_hackathon.app.service.impl;

import com.ai_hackathon.app.dto.request.ChatMessageRequest;
import com.ai_hackathon.app.dto.response.ChatMessageResponse;
import com.ai_hackathon.app.entity.ChatMessage;
import com.ai_hackathon.app.entity.SpecFile;
import com.ai_hackathon.app.exception.AppException;
import com.ai_hackathon.app.exception.ErrorCode;
import com.ai_hackathon.app.repository.ChatMessageRepository;
import com.ai_hackathon.app.repository.SpecFileRepository;
import com.ai_hackathon.app.service.ChatHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ChatHistoryServiceImpl implements ChatHistoryService {

    private final ChatMessageRepository chatMessageRepository;
    private final SpecFileRepository specFileRepository;

    @Override
    public List<ChatMessageResponse> getBySpecFile(Long specFileId) {
        if (!specFileRepository.existsById(specFileId)) {
            throw new AppException(ErrorCode.SPEC_FILE_NOT_FOUND);
        }
        return chatMessageRepository.findBySpecFileIdOrderByCreatedAtAsc(specFileId).stream()
                .map(ChatMessageResponse::from)
                .toList();
    }

    @Override
    public ChatMessageResponse getById(Long id) {
        return ChatMessageResponse.from(findOrThrow(id));
    }

    @Override
    @Transactional
    public ChatMessageResponse create(Long specFileId, ChatMessageRequest request) {
        SpecFile specFile = specFileRepository.findById(specFileId)
                .orElseThrow(() -> new AppException(ErrorCode.SPEC_FILE_NOT_FOUND));
        ChatMessage message = ChatMessage.builder()
                .content(request.getContent())
                .role(request.getRole())
                .specFile(specFile)
                .build();
        return ChatMessageResponse.from(chatMessageRepository.save(message));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!chatMessageRepository.existsById(id)) {
            throw new AppException(ErrorCode.CHAT_MESSAGE_NOT_FOUND);
        }
        chatMessageRepository.deleteById(id);
    }

    private ChatMessage findOrThrow(Long id) {
        return chatMessageRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CHAT_MESSAGE_NOT_FOUND));
    }
}
