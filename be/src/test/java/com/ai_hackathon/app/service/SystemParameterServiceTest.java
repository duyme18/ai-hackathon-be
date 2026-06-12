package com.ai_hackathon.app.service;

import com.ai_hackathon.app.dto.request.SystemParameterRequest;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class SystemParameterServiceTest {

    @Mock
    private SystemParameterRepository repository;

    @InjectMocks
    private SystemParameterServiceImpl service;

    // --- getAll ---

    @Test
    void getAll_returnsPageOfResponses() {
        SystemParameter param = buildParam(1L, "MAX_RETRY", "3", "desc");
        Pageable pageable = PageRequest.of(0, 20);
        when(repository.findByKeyword(anyString(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(param), pageable, 1));

        Page<SystemParameterResponse> result = service.getAll("MAX", pageable);

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getKey()).isEqualTo("MAX_RETRY");
        assertThat(result.getTotalElements()).isEqualTo(1);
    }

    @Test
    void getAll_emptyKeyword_returnsAll() {
        Pageable pageable = PageRequest.of(0, 20);
        when(repository.findByKeyword(isNull(), any(Pageable.class)))
                .thenReturn(Page.empty(pageable));

        Page<SystemParameterResponse> result = service.getAll(null, pageable);

        assertThat(result.getContent()).isEmpty();
    }

    // --- getById ---

    @Test
    void getById_found_returnsResponse() {
        when(repository.findById(1L)).thenReturn(Optional.of(buildParam(1L, "KEY", "val", null)));

        SystemParameterResponse response = service.getById(1L);

        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getKey()).isEqualTo("KEY");
    }

    @Test
    void getById_notFound_throwsNotFound() {
        when(repository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getById(99L))
                .isInstanceOf(AppException.class)
                .satisfies(ex -> assertThat(((AppException) ex).getErrorCode())
                        .isEqualTo(ErrorCode.SYSTEM_PARAMETER_NOT_FOUND));
    }

    // --- create ---

    @Test
    void create_newKey_returnsCreatedResponse() {
        SystemParameterRequest request = mockRequest("NEW_KEY", "value", "desc");
        when(repository.existsByKeyIgnoreCase("NEW_KEY")).thenReturn(false);
        when(repository.save(any(SystemParameter.class))).thenAnswer(inv -> {
            SystemParameter p = inv.getArgument(0);
            p = SystemParameter.builder()
                    .id(1L).key(p.getKey()).value(p.getValue()).description(p.getDescription())
                    .createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now())
                    .build();
            return p;
        });

        SystemParameterResponse response = service.create(request);

        assertThat(response.getKey()).isEqualTo("NEW_KEY");
        assertThat(response.getValue()).isEqualTo("value");
        verify(repository).save(any(SystemParameter.class));
    }

    @Test
    void create_duplicateKey_throwsKeyExists() {
        SystemParameterRequest request = mockRequest("DUP_KEY", "value", null);
        when(repository.existsByKeyIgnoreCase("DUP_KEY")).thenReturn(true);

        assertThatThrownBy(() -> service.create(request))
                .isInstanceOf(AppException.class)
                .satisfies(ex -> assertThat(((AppException) ex).getErrorCode())
                        .isEqualTo(ErrorCode.SYSTEM_PARAMETER_KEY_EXISTS));

        verify(repository, never()).save(any());
    }

    // --- update ---

    @Test
    void update_notInUse_updatesSuccessfully() {
        SystemParameter existing = buildParam(1L, "OLD_KEY", "old_val", null);
        SystemParameterRequest request = mockRequest("NEW_KEY", "new_val", "new desc");

        when(repository.findById(1L)).thenReturn(Optional.of(existing));
        when(repository.isInUse(1L)).thenReturn(false);
        when(repository.save(any(SystemParameter.class))).thenAnswer(inv -> inv.getArgument(0));

        SystemParameterResponse response = service.update(1L, request);

        assertThat(response.getKey()).isEqualTo("NEW_KEY");
        assertThat(response.getValue()).isEqualTo("new_val");
    }

    @Test
    void update_notFound_throwsNotFound() {
        when(repository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.update(99L, mockRequest("K", "v", null)))
                .isInstanceOf(AppException.class)
                .satisfies(ex -> assertThat(((AppException) ex).getErrorCode())
                        .isEqualTo(ErrorCode.SYSTEM_PARAMETER_NOT_FOUND));
    }

    @Test
    void update_inUse_throwsInUse() {
        when(repository.findById(1L)).thenReturn(Optional.of(buildParam(1L, "KEY", "val", null)));
        when(repository.isInUse(1L)).thenReturn(true);

        assertThatThrownBy(() -> service.update(1L, mockRequest("KEY", "new_val", null)))
                .isInstanceOf(AppException.class)
                .satisfies(ex -> assertThat(((AppException) ex).getErrorCode())
                        .isEqualTo(ErrorCode.SYSTEM_PARAMETER_IN_USE));

        verify(repository, never()).save(any());
    }

    // --- delete ---

    @Test
    void delete_notInUse_deletesSuccessfully() {
        when(repository.findById(1L)).thenReturn(Optional.of(buildParam(1L, "KEY", "val", null)));
        when(repository.isInUse(1L)).thenReturn(false);

        service.delete(1L);

        verify(repository).deleteById(1L);
    }

    @Test
    void delete_notFound_throwsNotFound() {
        when(repository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.delete(99L))
                .isInstanceOf(AppException.class)
                .satisfies(ex -> assertThat(((AppException) ex).getErrorCode())
                        .isEqualTo(ErrorCode.SYSTEM_PARAMETER_NOT_FOUND));

        verify(repository, never()).deleteById(anyLong());
    }

    @Test
    void delete_inUse_throwsInUse() {
        when(repository.findById(1L)).thenReturn(Optional.of(buildParam(1L, "KEY", "val", null)));
        when(repository.isInUse(1L)).thenReturn(true);

        assertThatThrownBy(() -> service.delete(1L))
                .isInstanceOf(AppException.class)
                .satisfies(ex -> assertThat(((AppException) ex).getErrorCode())
                        .isEqualTo(ErrorCode.SYSTEM_PARAMETER_IN_USE));

        verify(repository, never()).deleteById(anyLong());
    }

    // --- isInUse ---

    @Test
    void isInUse_parameterExists_returnsFalse() {
        when(repository.findById(1L)).thenReturn(Optional.of(buildParam(1L, "KEY", "val", null)));
        when(repository.isInUse(1L)).thenReturn(false);

        SystemParameterInUseResponse response = service.isInUse(1L);

        assertThat(response.isInUse()).isFalse();
    }

    @Test
    void isInUse_parameterInUse_returnsTrue() {
        when(repository.findById(1L)).thenReturn(Optional.of(buildParam(1L, "KEY", "val", null)));
        when(repository.isInUse(1L)).thenReturn(true);

        SystemParameterInUseResponse response = service.isInUse(1L);

        assertThat(response.isInUse()).isTrue();
    }

    @Test
    void isInUse_notFound_throwsNotFound() {
        when(repository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.isInUse(99L))
                .isInstanceOf(AppException.class)
                .satisfies(ex -> assertThat(((AppException) ex).getErrorCode())
                        .isEqualTo(ErrorCode.SYSTEM_PARAMETER_NOT_FOUND));
    }

    // --- helpers ---

    private SystemParameter buildParam(Long id, String key, String value, String description) {
        return SystemParameter.builder()
                .id(id).key(key).value(value).description(description)
                .createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now())
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
