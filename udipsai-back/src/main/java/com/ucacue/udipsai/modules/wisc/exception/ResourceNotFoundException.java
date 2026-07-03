package com.ucacue.udipsai.modules.wisc.exception;

import org.springframework.http.HttpStatus;

public class ResourceNotFoundException extends ApiException {
    public ResourceNotFoundException(String resourceName, String fieldName, Object fieldValue) {
        super(String.format("%s no encontrada con %s: '%s'", resourceName, fieldName, fieldValue), HttpStatus.NOT_FOUND);
    }
    
    public ResourceNotFoundException(String message) {
        super(message, HttpStatus.NOT_FOUND);
    }
}
