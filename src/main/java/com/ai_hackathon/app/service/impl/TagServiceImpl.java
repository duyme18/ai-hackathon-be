package com.ai_hackathon.app.service.impl;

import com.ai_hackathon.app.dto.request.TagRequest;
import com.ai_hackathon.app.dto.response.TagResponse;
import com.ai_hackathon.app.entity.Tag;
import com.ai_hackathon.app.entity.Task;
import com.ai_hackathon.app.exception.AppException;
import com.ai_hackathon.app.exception.ErrorCode;
import com.ai_hackathon.app.repository.TagRepository;
import com.ai_hackathon.app.repository.TaskRepository;
import com.ai_hackathon.app.service.TagService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TagServiceImpl implements TagService {

    private final TagRepository tagRepository;
    private final TaskRepository taskRepository;

    @Override
    public List<TagResponse> getByTask(Long taskId) {
        if (!taskRepository.existsById(taskId)) {
            throw new AppException(ErrorCode.TASK_NOT_FOUND);
        }
        return tagRepository.findByTaskId(taskId).stream()
                .map(TagResponse::from)
                .toList();
    }

    @Override
    public TagResponse getById(Long id) {
        return TagResponse.from(findOrThrow(id));
    }

    @Override
    @Transactional
    public TagResponse create(Long taskId, TagRequest request) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new AppException(ErrorCode.TASK_NOT_FOUND));
        Tag tag = Tag.builder()
                .name(request.getName())
                .color(request.getColor())
                .task(task)
                .build();
        return TagResponse.from(tagRepository.save(tag));
    }

    @Override
    @Transactional
    public TagResponse update(Long id, TagRequest request) {
        Tag tag = findOrThrow(id);
        tag.setName(request.getName());
        tag.setColor(request.getColor());
        return TagResponse.from(tagRepository.save(tag));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!tagRepository.existsById(id)) {
            throw new AppException(ErrorCode.TAG_NOT_FOUND);
        }
        tagRepository.deleteById(id);
    }

    private Tag findOrThrow(Long id) {
        return tagRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.TAG_NOT_FOUND));
    }
}
