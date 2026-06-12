package com.ai_hackathon.app.controller;

import com.ai_hackathon.app.dto.response.SystemParameterInUseResponse;
import com.ai_hackathon.app.dto.response.SystemParameterResponse;
import com.ai_hackathon.app.exception.AppException;
import com.ai_hackathon.app.exception.ErrorCode;
import com.ai_hackathon.app.exception.GlobalExceptionHandler;
import com.ai_hackathon.app.service.SystemParameterService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class SystemParameterControllerTest {

    @Mock
    private SystemParameterService service;

    @InjectMocks
    private SystemParameterController controller;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .standaloneSetup(controller)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    // --- GET list ---

    @Test
    void getAll_returns200WithPage() throws Exception {
        SystemParameterResponse param = buildResponse(1L, "MAX_RETRY", "3", "desc");
        when(service.getAll(any(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(param)));

        mockMvc.perform(get("/api/v1/system-parameters"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.data.content[0].key").value("MAX_RETRY"))
                .andExpect(jsonPath("$.data.totalElements").value(1));
    }

    // --- GET by id ---

    @Test
    void getById_found_returns200() throws Exception {
        when(service.getById(1L)).thenReturn(buildResponse(1L, "KEY", "val", null));

        mockMvc.perform(get("/api/v1/system-parameters/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.data.key").value("KEY"));
    }

    @Test
    void getById_notFound_returns404() throws Exception {
        when(service.getById(99L)).thenThrow(new AppException(ErrorCode.SYSTEM_PARAMETER_NOT_FOUND));

        mockMvc.perform(get("/api/v1/system-parameters/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    // --- POST create ---

    @Test
    void create_validRequest_returns201() throws Exception {
        when(service.create(any())).thenReturn(buildResponse(1L, "MAX_RETRY", "3", "desc"));

        mockMvc.perform(post("/api/v1/system-parameters")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "key": "MAX_RETRY",
                                  "value": "3",
                                  "description": "desc"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value(201))
                .andExpect(jsonPath("$.data.key").value("MAX_RETRY"));
    }

    @Test
    void create_lowercaseKey_returns400() throws Exception {
        mockMvc.perform(post("/api/v1/system-parameters")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "key": "lowercase_key",
                                  "value": "3"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    void create_missingKey_returns400() throws Exception {
        mockMvc.perform(post("/api/v1/system-parameters")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "value": "3"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    void create_missingValue_returns400() throws Exception {
        mockMvc.perform(post("/api/v1/system-parameters")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "key": "VALID_KEY"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    void create_keyTooLong_returns400() throws Exception {
        mockMvc.perform(post("/api/v1/system-parameters")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "key": "ABCDEFGHIJKLMNOPQRSTU",
                                  "value": "v"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    void create_duplicateKey_returns409() throws Exception {
        when(service.create(any())).thenThrow(new AppException(ErrorCode.SYSTEM_PARAMETER_KEY_EXISTS));

        mockMvc.perform(post("/api/v1/system-parameters")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "key": "DUP_KEY",
                                  "value": "3"
                                }
                                """))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409));
    }

    // --- PUT update ---

    @Test
    void update_validRequest_returns200() throws Exception {
        when(service.update(anyLong(), any())).thenReturn(buildResponse(1L, "KEY", "updated", null));

        mockMvc.perform(put("/api/v1/system-parameters/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "key": "KEY",
                                  "value": "updated"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.value").value("updated"));
    }

    @Test
    void update_inUse_returns409() throws Exception {
        when(service.update(anyLong(), any())).thenThrow(new AppException(ErrorCode.SYSTEM_PARAMETER_IN_USE));

        mockMvc.perform(put("/api/v1/system-parameters/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "key": "KEY",
                                  "value": "v"
                                }
                                """))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409));
    }

    @Test
    void update_notFound_returns404() throws Exception {
        when(service.update(anyLong(), any())).thenThrow(new AppException(ErrorCode.SYSTEM_PARAMETER_NOT_FOUND));

        mockMvc.perform(put("/api/v1/system-parameters/99")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "key": "KEY",
                                  "value": "v"
                                }
                                """))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    // --- DELETE ---

    @Test
    void delete_notInUse_returns200() throws Exception {
        mockMvc.perform(delete("/api/v1/system-parameters/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(200));
    }

    @Test
    void delete_inUse_returns409() throws Exception {
        doThrow(new AppException(ErrorCode.SYSTEM_PARAMETER_IN_USE)).when(service).delete(1L);

        mockMvc.perform(delete("/api/v1/system-parameters/1"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409));
    }

    @Test
    void delete_notFound_returns404() throws Exception {
        doThrow(new AppException(ErrorCode.SYSTEM_PARAMETER_NOT_FOUND)).when(service).delete(99L);

        mockMvc.perform(delete("/api/v1/system-parameters/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    // --- GET in-use ---

    @Test
    void isInUse_returns200WithFlag() throws Exception {
        when(service.isInUse(1L)).thenReturn(new SystemParameterInUseResponse(false));

        mockMvc.perform(get("/api/v1/system-parameters/1/in-use"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.inUse").value(false));
    }

    @Test
    void isInUse_notFound_returns404() throws Exception {
        when(service.isInUse(99L)).thenThrow(new AppException(ErrorCode.SYSTEM_PARAMETER_NOT_FOUND));

        mockMvc.perform(get("/api/v1/system-parameters/99/in-use"))
                .andExpect(status().isNotFound());
    }

    // --- helpers ---

    private SystemParameterResponse buildResponse(Long id, String key, String value, String description) {
        return SystemParameterResponse.builder()
                .id(id).key(key).value(value).description(description)
                .createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now())
                .build();
    }
}
