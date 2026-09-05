package com.vjeditor.auth;

public record TokenResponse(String token, String tokenType, long expiresInSeconds) {
}
