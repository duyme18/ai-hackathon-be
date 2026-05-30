package com.ai_hackathon.app.repository;

import com.ai_hackathon.app.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    List<ChatMessage> findBySpecFileIdOrderByCreatedAtAsc(Long specFileId);
}
