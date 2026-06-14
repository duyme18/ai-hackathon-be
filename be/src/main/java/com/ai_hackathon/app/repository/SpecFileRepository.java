package com.ai_hackathon.app.repository;

import com.ai_hackathon.app.entity.SpecFile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SpecFileRepository extends JpaRepository<SpecFile, Long> {

    List<SpecFile> findByTagId(Long tagId);
}
