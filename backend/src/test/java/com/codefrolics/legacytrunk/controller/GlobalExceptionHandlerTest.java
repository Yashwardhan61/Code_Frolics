package com.codefrolics.legacytrunk.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler exceptionHandler;

    @BeforeEach
    void setUp() {
        exceptionHandler = new GlobalExceptionHandler();
    }

    @Test
    @DisplayName("handleAccessDenied returns 403 Forbidden with structured body")
    void testHandleAccessDenied() {
        AccessDeniedException ex = new AccessDeniedException("Access is denied");

        ResponseEntity<Map<String, Object>> response = exceptionHandler.handleAccessDenied(ex);

        assertNotNull(response);
        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        assertEquals(403, response.getBody().get("status"));
        assertEquals("Forbidden", response.getBody().get("error"));
        assertTrue(response.getBody().containsKey("timestamp"));
    }

    @Test
    @DisplayName("handleMaxUploadSize returns 413 Payload Too Large")
    void testHandleMaxUploadSize() {
        MaxUploadSizeExceededException ex = new MaxUploadSizeExceededException(50 * 1024 * 1024);

        ResponseEntity<Map<String, Object>> response = exceptionHandler.handleMaxUploadSize(ex);

        assertNotNull(response);
        assertEquals(HttpStatus.PAYLOAD_TOO_LARGE, response.getStatusCode());
        assertEquals(413, response.getBody().get("status"));
    }

    @Test
    @DisplayName("handleIllegalArgument returns 400 Bad Request with message")
    void testHandleIllegalArgument() {
        IllegalArgumentException ex = new IllegalArgumentException("Invalid date range provided");

        ResponseEntity<Map<String, Object>> response = exceptionHandler.handleIllegalArgument(ex);

        assertNotNull(response);
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Invalid date range provided", response.getBody().get("message"));
    }

    @Test
    @DisplayName("handleValidationExceptions returns 400 with field errors map")
    void testHandleValidationExceptions() throws NoSuchMethodException {
        com.codefrolics.legacytrunk.dto.StoryRequest target = new com.codefrolics.legacytrunk.dto.StoryRequest();
        org.springframework.validation.BeanPropertyBindingResult bindingResult = 
                new org.springframework.validation.BeanPropertyBindingResult(target, "storyRequest");
        bindingResult.addError(new FieldError("storyRequest", "title", "Title is required"));
        bindingResult.addError(new FieldError("storyRequest", "description", "Description too long"));

        java.lang.reflect.Method method = this.getClass().getDeclaredMethod("setUp");
        org.springframework.core.MethodParameter parameter = new org.springframework.core.MethodParameter(method, -1);
        MethodArgumentNotValidException ex = new MethodArgumentNotValidException(parameter, bindingResult);

        ResponseEntity<Map<String, Object>> response = exceptionHandler.handleValidationExceptions(ex);

        assertNotNull(response);
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertTrue(response.getBody().containsKey("errors"));

        @SuppressWarnings("unchecked")
        Map<String, String> errors = (Map<String, String>) response.getBody().get("errors");
        assertEquals("Title is required", errors.get("title"));
        assertEquals("Description too long", errors.get("description"));
    }

    @Test
    @DisplayName("handleGenericException returns 500 without leaking stack traces")
    void testHandleGenericException() {
        Exception ex = new NullPointerException("Null pointer in service");

        ResponseEntity<Map<String, Object>> response = exceptionHandler.handleGenericException(ex);

        assertNotNull(response);
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertEquals(500, response.getBody().get("status"));
        assertEquals("An unexpected error occurred. Please try again later.", response.getBody().get("message"));
    }
}
