package com.ai_hackathon.app.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.data.domain.Page;

import java.util.List;

@Getter
@AllArgsConstructor
public class PageResponse<T> {
    private List<T> content;
    private long totalElements;
    private int totalPages;
    private int page;
    private int size;
    private boolean first;
    private boolean last;

    public static <T> PageResponse<T> from(Page<T> p) {
        return new PageResponse<>(
                p.getContent(),
                p.getTotalElements(),
                p.getTotalPages(),
                p.getNumber(),
                p.getSize(),
                p.isFirst(),
                p.isLast()
        );
    }
}
