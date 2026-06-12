package com.ai_hackathon.app.repository;

import com.ai_hackathon.app.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectRepository extends JpaRepository<Project, Long> {
}
