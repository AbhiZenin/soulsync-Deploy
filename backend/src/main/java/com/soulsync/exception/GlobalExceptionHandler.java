package com.soulsync.exception;

import lombok.extern.slf4j.Slf4j;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.Map;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    public record ApiError(
            Instant timestamp,
            int status,
            String error,
            String message
    ) {
    }

    @ExceptionHandler(NotFoundException.class)
    ResponseEntity<ApiError> notFound(
            NotFoundException e
    ) {
        return error(
                HttpStatus.NOT_FOUND,
                e.getMessage()
        );
    }

    @ExceptionHandler(BadRequestException.class)
    ResponseEntity<ApiError> bad(
            BadRequestException e
    ) {
        return error(
                HttpStatus.BAD_REQUEST,
                e.getMessage()
        );
    }

    @ExceptionHandler(ConflictException.class)
    ResponseEntity<ApiError> conflict(
            ConflictException e
    ) {
        return error(
                HttpStatus.CONFLICT,
                e.getMessage()
        );
    }

    @ExceptionHandler({
            ForbiddenException.class,
            AccessDeniedException.class
    })
    ResponseEntity<ApiError> forbidden(
            RuntimeException e
    ) {
        return error(
                HttpStatus.FORBIDDEN,
                e.getMessage()
        );
    }

    @ExceptionHandler(
            MethodArgumentNotValidException.class
    )
    ResponseEntity<ApiError> validation(
            MethodArgumentNotValidException e
    ) {

        String message =
                e.getBindingResult()
                        .getFieldErrors()
                        .stream()
                        .findFirst()
                        .map(error ->
                                error.getField()
                                        + ": "
                                        + error.getDefaultMessage()
                        )
                        .orElse(
                                "Validation failed"
                        );

        return error(
                HttpStatus.BAD_REQUEST,
                message
        );
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<ApiError> fallback(
            Exception e
    ) {

        log.error(
                "Unhandled server exception",
                e
        );

        return error(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Unexpected server error"
        );
    }

    private ResponseEntity<ApiError> error(
            HttpStatus status,
            String message
    ) {

        ApiError body =
                new ApiError(
                        Instant.now(),
                        status.value(),
                        status.getReasonPhrase(),
                        message
                );

        return ResponseEntity
                .status(status)
                .body(body);
    }
}