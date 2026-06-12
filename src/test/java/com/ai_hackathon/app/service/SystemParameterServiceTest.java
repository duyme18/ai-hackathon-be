package com.ai_hackathon.app.service;

import com.ai_hackathon.app.dto.request.SystemParameterRequest;
import com.ai_hackathon.app.dto.response.PageResponse;
import com.ai_hackathon.app.dto.response.SystemParameterInUseResponse;
import com.ai_hackathon.app.dto.response.SystemParameterResponse;
import com.ai_hackathon.app.entity.SystemParameter;
import com.ai_hackathon.app.exception.AppException;
import com.ai_hackathon.app.exception.ErrorCode;
import com.ai_hackathon.app.repository.SystemParameterRepository;
import com.ai_hackathon.app.service.impl.SystemParameterServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class SystemParameterServiceTest {

    @Mock
    private SystemParameterRepository repository;

    @InjectMocks
    private SystemParameterServiceImpl service;

    // ── getAll ────────────────────────────────────────────────────────────────

    @Test
    void getAll_noKeyword_returnsPagedResults() {
        SystemParameter param = buildParam(1L, "KEY_ONE", "value1", "desc1");
        when(repository.findByKeyword(any(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(param)));

        PageResponse<SystemParameterResponse> result = service.getAll(null, 0, 10);

        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getKey()).isEqualTo("KEY_ONE");
    }

    @Test
    void getAll_withKeyword_passesKeywordToRepository() {
        when(repository.findByKeyword(eq("MAX"), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of()));

        PageResponse<SystemParameterResponse> result = service.getAll("MAX", 0, 10);

        assertThat(result.getContent()).isEmpty();
        verify(repository).findByKeyword(eq("MAX"), any(Pageable.class));
    }

    // ── getById ───────────────────────────────────────────────────────────────

    @Test
    void getById_existingId_returnsResponse() {
        when(repository.findById(1L)).thenReturn(Optional.of(buildParam(1L, "KEY_ONE", "v", "d")));

        SystemParameterResponse result = service.getById(1L);

        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getKey()).isEqualTo("KEY_ONE");
    }

    @Test
    void getById_unknownId_throwsNotFound() {
        when(repository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getById(99L))
                .isInstanceOf(AppException.class)
                .satisfies(ex -> assertThat(((AppException) ex).getErrorCode())
                        .isEqualTo(ErrorCode.SYSTEM_PARAMETER_NOT_FOUND));
    }

    // ── create ────────────────────────────────────────────────────────────────

    @Test
    void create_uniqueKey_savesAndReturnsResponse() {
        SystemParameterRequest request = mockRequest("NEW_KEY", "value", "desc");
        when(repository.existsByKeyIgnoreCase("NEW_KEY")).thenReturn(false);
        when(repository.save(any(SystemParameter.class))).thenAnswer(i -> i.getArgument(0));

        SystemParameterResponse result = service.create(request);

        assertThat(result.getKey()).isEqualTo("NEW_KEY");
        assertThat(result.getValue()).isEqualTo("value");
        verify(repository).save(any(SystemParameter.class));
    }

    @Test
    void create_duplicateKey_throwsKeyExists() {
        SystemParameterRequest request = mockRequest("EXISTING_KEY", "value", null);
        when(repository.existsByKeyIgnoreCase("EXISTING_KEY")).thenReturn(true);

        assertThatThrownBy(() -> service.create(request))
                .isInstanceOf(AppException.class)
                .satisfies(ex -> assertThat(((AppException) ex).getErrorCode())
                        .isEqualTo(ErrorCode.SYSTEM_PARAMETER_KEY_EXISTS));

        verify(repository, never()).save(any());
    }

    // ── update ────────────────────────────────────────────────────────────────

    @Test
    void update_notInUse_updatesAndReturnsResponse() {
        SystemParameter existing = buildParam(1L, "OLD_KEY", "old-value", "old-desc");
        SystemParameterRequest request = mockRequest("NEW_KEY", "new-value", "new-desc");

        when(repository.findById(1L)).thenReturn(Optional.of(existing));
        when(repository.isInUse(1L)).thenReturn(false);
        when(repository.existsByKeyIgnoreCase("NEW_KEY")).thenReturn(false);
        when(repository.save(any())).thenAnswer(i -> i.getArgument(0));

        SystemParameterResponse result = service.update(1L, request);

        assertThat(result.getKey()).isEqualTo("NEW_KEY");
        assertThat(result.getValue()).isEqualTo("new-value");
    }

    @Test
    void update_inUse_throwsInUse() {
        when(repository.findById(1L)).thenReturn(Optional.of(buildParam(1L, "KEY", "v", null)));
        when(repository.isInUse(1L)).thenReturn(true);

        assertThatThrownBy(() -> service.update(1L, mockRequest("KEY", "new-value", null)))
                .isInstanceOf(AppException.class)
                .satisfies(ex -> assertThat(((AppException) ex).getErrorCode())
                        .isEqualTo(ErrorCode.SYSTEM_PARAMETER_IN_USE));

        verify(repository, never()).save(any());
    }

    @Test
    void update_sameKey_doesNotCheckKeyUniqueness() {
        SystemParameter existing = buildParam(1L, "SAME_KEY", "old-value", null);
        when(repository.findById(1L)).thenReturn(Optional.of(existing));
        when(repository.isInUse(1L)).thenReturn(false);
        when(repository.save(any())).thenAnswer(i -> i.getArgument(0));

        service.update(1L, mockRequest("SAME_KEY", "updated-value", null));

        verify(repository, never()).existsByKeyIgnoreCase(anyString());
    }

    @Test
    void update_keyChangedToDuplicate_throwsKeyExists() {
        when(repository.findById(1L)).thenReturn(Optional.of(buildParam(1L, "OLD_KEY", "v", null)));
        when(repository.isInUse(1L)).thenReturn(false);
        when(repository.existsByKeyIgnoreCase("TAKEN_KEY")).thenReturn(true);

        assertThatThrownBy(() -> service.update(1L, mockRequest("TAKEN_KEY", "v", null)))
                .isInstanceOf(AppException.class)
                .satisfies(ex -> assertThat(((AppException) ex).getErrorCode())
                        .isEqualTo(ErrorCode.SYSTEM_PARAMETER_KEY_EXISTS));
    }

    @Test
    void update_unknownId_throwsNotFound() {
        when(repository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.update(99L, mockRequest("KEY", "val", null)))
                .isInstanceOf(AppException.class)
                .satisfies(ex -> assertThat(((AppException) ex).getErrorCode())
                        .isEqualTo(ErrorCode.SYSTEM_PARAMETER_NOT_FOUND));
    }

    // ── delete ────────────────────────────────────────────────────────────────

    @Test
    void delete_notInUse_deletesSuccessfully() {
        when(repository.existsById(1L)).thenReturn(true);
        when(repository.isInUse(1L)).thenReturn(false);

        service.delete(1L);

        verify(repository).deleteById(1L);
    }

    @Test
    void delete_inUse_throwsInUse() {
        when(repository.existsById(1L)).thenReturn(true);
        when(repository.isInUse(1L)).thenReturn(true);

        assertThatThrownBy(() -> service.delete(1L))
                .isInstanceOf(AppException.class)
                .satisfies(ex -> assertThat(((AppException) ex).getErrorCode())
                        .isEqualTo(ErrorCode.SYSTEM_PARAMETER_IN_USE));

        verify(repository, never()).deleteById(any());
    }

    @Test
    void delete_unknownId_throwsNotFound() {
        when(repository.existsById(99L)).thenReturn(false);

        assertThatThrownBy(() -> service.delete(99L))
                .isInstanceOf(AppException.class)
                .satisfies(ex -> assertThat(((AppException) ex).getErrorCode())
                        .isEqualTo(ErrorCode.SYSTEM_PARAMETER_NOT_FOUND));

        verify(repository, never()).deleteById(any());
    }

    // ── checkInUse ────────────────────────────────────────────────────────────

    @Test
    void checkInUse_parameterInUse_returnsTrue() {
        when(repository.existsById(1L)).thenReturn(true);
        when(repository.isInUse(1L)).thenReturn(true);

        SystemParameterInUseResponse result = service.checkInUse(1L);

        assertThat(result.isInUse()).isTrue();
    }

    @Test
    void checkInUse_parameterNotInUse_returnsFalse() {
        when(repository.existsById(1L)).thenReturn(true);
        when(repository.isInUse(1L)).thenReturn(false);

        SystemParameterInUseResponse result = service.checkInUse(1L);

        assertThat(result.isInUse()).isFalse();
    }

    @Test
    void checkInUse_unknownId_throwsNotFound() {
        when(repository.existsById(99L)).thenReturn(false);

        assertThatThrownBy(() -> service.checkInUse(99L))
                .isInstanceOf(AppException.class)
                .satisfies(ex -> assertThat(((AppException) ex).getErrorCode())
                        .isEqualTo(ErrorCode.SYSTEM_PARAMETER_NOT_FOUND));
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private SystemParameter buildParam(Long id, String key, String value, String description) {
        return SystemParameter.builder()
                .id(id)
                .key(key)
                .value(value)
                .description(description)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    private SystemParameterRequest mockRequest(String key, String value, String description) {
        SystemParameterRequest req = mock(SystemParameterRequest.class);
        when(req.getKey()).thenReturn(key);
        when(req.getValue()).thenReturn(value);
        when(req.getDescription()).thenReturn(description);
        return req;
    }
}
