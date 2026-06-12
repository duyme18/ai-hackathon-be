package com.ai_hackathon.app.controller;

import com.ai_hackathon.app.dto.response.PageResponse;
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
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class SystemParameterControllerTest {

    @Mock
    private SystemParameterService systemParameterService;

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

    // ── GET /system-parameters ────────────────────────────────────────────────

    @Test
    void getAll_defaultParams_returns200WithPagedList() throws Exception {
        PageResponse<SystemParameterResponse> page = new PageResponse<>(
                List.of(buildResponse(1L, "MAX_RETRY", "3", "max retries")),
                1L, 1, 0, 10, true, true);
        when(systemParameterService.getAll(any(), anyInt(), anyInt())).thenReturn(page);

        mockMvc.perform(get("/api/v1/system-parameters"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.data.totalElements").value(1))
                .andExpect(jsonPath("$.data.content[0].key").value("MAX_RETRY"))
                .andExpect(jsonPath("$.data.content[0].value").value("3"));
    }

    @Test
    void getAll_withKeyword_passesKeywordToService() throws Exception {
        PageResponse<SystemParameterResponse> emptyPage = new PageResponse<>(
                List.of(), 0L, 0, 0, 10, true, true);
        when(systemParameterService.getAll(eq("SMTP"), anyInt(), anyInt())).thenReturn(emptyPage);

        mockMvc.perform(get("/api/v1/system-parameters").param("keyword", "SMTP"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalElements").value(0));
    }

    // ── GET /system-parameters/{id} ───────────────────────────────────────────

    @Test
    void getById_existingId_returns200() throws Exception {
        when(systemParameterService.getById(1L))
                .thenReturn(buildResponse(1L, "HOST", "localhost", null));

        mockMvc.perform(get("/api/v1/system-parameters/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.data.key").value("HOST"))
                .andExpect(jsonPath("$.data.value").value("localhost"));
    }

    @Test
    void getById_unknownId_returns404() throws Exception {
        when(systemParameterService.getById(99L))
                .thenThrow(new AppException(ErrorCode.SYSTEM_PARAMETER_NOT_FOUND));

        mockMvc.perform(get("/api/v1/system-parameters/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    // ── POST /system-parameters ───────────────────────────────────────────────

    @Test
    void create_validRequest_returns201() throws Exception {
        when(systemParameterService.create(any()))
                .thenReturn(buildResponse(1L, "MAX_CONN", "100", "max connections"));

        mockMvc.perform(post("/api/v1/system-parameters")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "key": "MAX_CONN",
                                  "value": "100",
                                  "description": "max connections"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value(201))
                .andExpect(jsonPath("$.data.key").value("MAX_CONN"));
    }

    @Test
    void create_missingKey_returns400() throws Exception {
        mockMvc.perform(post("/api/v1/system-parameters")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "value": "100"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    void create_keyWithLowercaseLetters_returns400() throws Exception {
        mockMvc.perform(post("/api/v1/system-parameters")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "key": "invalid_key",
                                  "value": "100"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    void create_keyExceeds20Chars_returns400() throws Exception {
        mockMvc.perform(post("/api/v1/system-parameters")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "key": "A_KEY_THAT_IS_WAY_TOO_LONG_FOR_THE_LIMIT",
                                  "value": "100"
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
                                  "key": "MAX_CONN"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    void create_duplicateKey_returns409() throws Exception {
        when(systemParameterService.create(any()))
                .thenThrow(new AppException(ErrorCode.SYSTEM_PARAMETER_KEY_EXISTS));

        mockMvc.perform(post("/api/v1/system-parameters")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "key": "EXISTING",
                                  "value": "val"
                                }
                                """))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409));
    }

    // ── PUT /system-parameters/{id} ───────────────────────────────────────────

    @Test
    void update_validRequest_returns200() throws Exception {
        when(systemParameterService.update(eq(1L), any()))
                .thenReturn(buildResponse(1L, "MAX_CONN", "200", "updated"));

        mockMvc.perform(put("/api/v1/system-parameters/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "key": "MAX_CONN",
                                  "value": "200",
                                  "description": "updated"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.data.value").value("200"));
    }

    @Test
    void update_parameterInUse_returns409() throws Exception {
        when(systemParameterService.update(eq(1L), any()))
                .thenThrow(new AppException(ErrorCode.SYSTEM_PARAMETER_IN_USE));

        mockMvc.perform(put("/api/v1/system-parameters/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "key": "MAX_CONN",
                                  "value": "200"
                                }
                                """))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409));
    }

    @Test
    void update_unknownId_returns404() throws Exception {
        when(systemParameterService.update(eq(99L), any()))
                .thenThrow(new AppException(ErrorCode.SYSTEM_PARAMETER_NOT_FOUND));

        mockMvc.perform(put("/api/v1/system-parameters/99")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "key": "MAX_CONN",
                                  "value": "200"
                                }
                                """))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    // ── DELETE /system-parameters/{id} ────────────────────────────────────────

    @Test
    void delete_notInUse_returns200WithNullData() throws Exception {
        doNothing().when(systemParameterService).delete(1L);

        mockMvc.perform(delete("/api/v1/system-parameters/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.data").isEmpty());
    }

    @Test
    void delete_parameterInUse_returns409() throws Exception {
        doThrow(new AppException(ErrorCode.SYSTEM_PARAMETER_IN_USE))
                .when(systemParameterService).delete(1L);

        mockMvc.perform(delete("/api/v1/system-parameters/1"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409));
    }

    @Test
    void delete_unknownId_returns404() throws Exception {
        doThrow(new AppException(ErrorCode.SYSTEM_PARAMETER_NOT_FOUND))
                .when(systemParameterService).delete(99L);

        mockMvc.perform(delete("/api/v1/system-parameters/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    // ── GET /system-parameters/{id}/in-use ────────────────────────────────────

    @Test
    void checkInUse_parameterInUse_returns200WithTrueFlag() throws Exception {
        when(systemParameterService.checkInUse(1L))
                .thenReturn(new SystemParameterInUseResponse(true));

        mockMvc.perform(get("/api/v1/system-parameters/1/in-use"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.data.inUse").value(true));
    }

    @Test
    void checkInUse_parameterNotInUse_returns200WithFalseFlag() throws Exception {
        when(systemParameterService.checkInUse(2L))
                .thenReturn(new SystemParameterInUseResponse(false));

        mockMvc.perform(get("/api/v1/system-parameters/2/in-use"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.inUse").value(false));
    }

    @Test
    void checkInUse_unknownId_returns404() throws Exception {
        when(systemParameterService.checkInUse(99L))
                .thenThrow(new AppException(ErrorCode.SYSTEM_PARAMETER_NOT_FOUND));

        mockMvc.perform(get("/api/v1/system-parameters/99/in-use"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private SystemParameterResponse buildResponse(Long id, String key, String value, String description) {
        return SystemParameterResponse.builder()
                .id(id)
                .key(key)
                .value(value)
                .description(description)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }
}
