package com.cutie.collection.backend.exception;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(CategoryNotFoundException.class)
    public ResponseEntity<ApiErrorResponse>
            handleCategoryNotFound(
                    CategoryNotFoundException exception,
                    HttpServletRequest request) {

        return buildResponse(
                HttpStatus.NOT_FOUND,
                exception.getMessage(),
                request);
    }

    @ExceptionHandler(ProductNotFoundException.class)
    public ResponseEntity<ApiErrorResponse>
            handleProductNotFound(
                    ProductNotFoundException exception,
                    HttpServletRequest request) {

        return buildResponse(
                HttpStatus.NOT_FOUND,
                exception.getMessage(),
                request);
    }

    @ExceptionHandler(OrderNotFoundException.class)
    public ResponseEntity<ApiErrorResponse>
            handleOrderNotFound(
                    OrderNotFoundException exception,
                    HttpServletRequest request) {

        return buildResponse(
                HttpStatus.NOT_FOUND,
                exception.getMessage(),
                request);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiErrorResponse>
            handleResourceNotFound(
                    ResourceNotFoundException exception,
                    HttpServletRequest request) {

        return buildResponse(
                HttpStatus.NOT_FOUND,
                exception.getMessage(),
                request);
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ApiErrorResponse>
            handleBadRequest(
                    BadRequestException exception,
                    HttpServletRequest request) {

        return buildResponse(
                HttpStatus.BAD_REQUEST,
                exception.getMessage(),
                request);
    }

    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<ApiErrorResponse>
            handleConflict(
                    ConflictException exception,
                    HttpServletRequest request) {

        return buildResponse(
                HttpStatus.CONFLICT,
                exception.getMessage(),
                request);
    }

    @ExceptionHandler(InsufficientStockException.class)
    public ResponseEntity<ApiErrorResponse>
            handleInsufficientStock(
                    InsufficientStockException exception,
                    HttpServletRequest request) {

        return buildResponse(
                HttpStatus.CONFLICT,
                exception.getMessage(),
                request);
    }

    @ExceptionHandler(PaymentException.class)
    public ResponseEntity<ApiErrorResponse>
            handlePaymentException(
                    PaymentException exception,
                    HttpServletRequest request) {

        return buildResponse(
                HttpStatus.BAD_REQUEST,
                exception.getMessage(),
                request);
    }

    @ExceptionHandler(UnauthorizedOperationException.class)
    public ResponseEntity<ApiErrorResponse>
            handleUnauthorizedOperation(
                    UnauthorizedOperationException exception,
                    HttpServletRequest request) {

        return buildResponse(
                HttpStatus.FORBIDDEN,
                exception.getMessage(),
                request);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiErrorResponse>
            handleAccessDenied(
                    AccessDeniedException exception,
                    HttpServletRequest request) {

        return buildResponse(
                HttpStatus.FORBIDDEN,
                "You do not have permission to perform this operation",
                request);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse>
            handleValidationErrors(
                    MethodArgumentNotValidException exception,
                    HttpServletRequest request) {

        Map<String, String> validationErrors =
                new LinkedHashMap<>();

        for (FieldError fieldError :
                exception.getBindingResult().getFieldErrors()) {

            validationErrors.putIfAbsent(
                    fieldError.getField(),
                    fieldError.getDefaultMessage());
        }

        ApiErrorResponse response =
                ApiErrorResponse.validation(
                        HttpStatus.BAD_REQUEST.value(),
                        HttpStatus.BAD_REQUEST.getReasonPhrase(),
                        "Request validation failed",
                        request.getRequestURI(),
                        validationErrors
                );

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(response);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiErrorResponse>
            handleConstraintViolation(
                    ConstraintViolationException exception,
                    HttpServletRequest request) {

        Map<String, String> validationErrors =
                new LinkedHashMap<>();

        for (ConstraintViolation<?> violation :
                exception.getConstraintViolations()) {

            validationErrors.put(
                    violation.getPropertyPath().toString(),
                    violation.getMessage());
        }

        ApiErrorResponse response =
                ApiErrorResponse.validation(
                        HttpStatus.BAD_REQUEST.value(),
                        HttpStatus.BAD_REQUEST.getReasonPhrase(),
                        "Request validation failed",
                        request.getRequestURI(),
                        validationErrors
                );

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(response);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiErrorResponse>
            handleUnreadableRequest(
                    HttpMessageNotReadableException exception,
                    HttpServletRequest request) {

        return buildResponse(
                HttpStatus.BAD_REQUEST,
                "Request body is missing or contains invalid data",
                request);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiErrorResponse>
            handleTypeMismatch(
                    MethodArgumentTypeMismatchException exception,
                    HttpServletRequest request) {

        String message =
                "Invalid value for parameter: "
                        + exception.getName();

        return buildResponse(
                HttpStatus.BAD_REQUEST,
                message,
                request);
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ApiErrorResponse>
            handleMissingParameter(
                    MissingServletRequestParameterException exception,
                    HttpServletRequest request) {

        String message =
                "Required parameter is missing: "
                        + exception.getParameterName();

        return buildResponse(
                HttpStatus.BAD_REQUEST,
                message,
                request);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiErrorResponse>
            handleDataIntegrityViolation(
                    DataIntegrityViolationException exception,
                    HttpServletRequest request) {

        /*
         * Do not expose raw database errors because they may reveal
         * table names, column names, SQL, or other internal details.
         */
        return buildResponse(
                HttpStatus.CONFLICT,
                "The requested operation conflicts with existing data",
                request);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiErrorResponse>
            handleIllegalArgument(
                    IllegalArgumentException exception,
                    HttpServletRequest request) {

        return buildResponse(
                HttpStatus.BAD_REQUEST,
                safeMessage(
                        exception,
                        "The request contains an invalid value"),
                request);
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ApiErrorResponse>
            handleIllegalState(
                    IllegalStateException exception,
                    HttpServletRequest request) {

        return buildResponse(
                HttpStatus.CONFLICT,
                safeMessage(
                        exception,
                        "The requested operation cannot be completed"),
                request);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse>
            handleUnexpectedException(
                    Exception exception,
                    HttpServletRequest request) {

        /*
         * Log the exception through a logger when logging is added.
         * Never return exception.getMessage() for unexpected failures.
         */
        return buildResponse(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "An unexpected error occurred. Please try again later",
                request);
    }

    private ResponseEntity<ApiErrorResponse> buildResponse(
            HttpStatus status,
            String message,
            HttpServletRequest request) {

        ApiErrorResponse response =
                ApiErrorResponse.of(
                        status.value(),
                        status.getReasonPhrase(),
                        message,
                        request.getRequestURI()
                );

        return ResponseEntity
                .status(status)
                .body(response);
    }

    private String safeMessage(
            RuntimeException exception,
            String defaultMessage) {

        String message = exception.getMessage();

        if (message == null || message.isBlank()) {
            return defaultMessage;
        }

        return message;
    }
}