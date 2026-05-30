package com.ai_hackathon.app.repository;

import com.ai_hackathon.app.entity.Tag;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TagRepository extends JpaRepository<Tag, Long> {

    List<Tag> findByTaskId(Long taskId);
}
