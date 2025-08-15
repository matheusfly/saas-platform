---
title: Authentication API
description: Detailed documentation of authentication endpoints and flows
---

# Authentication API

This document provides detailed information about the authentication system in the SaaS BI Platform API.

## Authentication Flow

### 1. Password-based Authentication

```mermaid
sequenceDiagram
    participant Client
    participant API
    
    Client->>API: POST /api/auth/login
    Note over Client,API: {email, password}
    API->>API: Validate credentials
    API-->>Client: 200 OK {accessToken, refreshToken, user}
    
    loop Token Refresh
        Client->>API: POST /api/auth/refresh-token
        Note over Client,API: {refreshToken}
        API-->>Client: 200 OK {accessToken}
    end
```

### 2. Access Token Usage

Include the access token in the `Authorization` header:

```http
GET /api/protected-route
Authorization: Bearer your-access-token-here
```

## Endpoints

### Login

Authenticate a user and retrieve access and refresh tokens.

```http
POST /api/auth/login
```

**Request Body**
```json
{
  "email": "user@example.com",
  "password": "your-password"
}
```

**Response**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "admin"
  }
}
```

### Refresh Token

Obtain a new access token using a refresh token.

```http
POST /api/auth/refresh-token
```

**Request Body**
```json
{
  "refreshToken": "your-refresh-token"
}
```

**Response**
```json
{
  "accessToken": "new-access-token",
  "expiresIn": 3600
}
```

### Logout

Invalidate the current session and revoke tokens.

```http
POST /api/auth/logout
```

**Request Headers**
```
Authorization: Bearer your-access-token-here
```

**Response**
```json
{
  "success": true
}
```

## Token Management

### Access Token

- **Lifetime**: 1 hour
- **Storage**: Memory or secure HTTP-only cookie
- **Claims**:
  ```json
  {
    "sub": "user-id",
    "email": "user@example.com",
    "role": "admin",
    "iat": 1516239022,
    "exp": 1516242622
  }
  ```

### Refresh Token

- **Lifetime**: 7 days
- **Storage**: Secure HTTP-only cookie or secure storage
- **Single Use**: Automatically rotated on use
- **Revocation**: Automatically revoked on logout or security event

## Security Considerations

### Token Storage

- **Web**: Store in HTTP-only, Secure, SameSite=Strict cookies
- **Mobile/Desktop**: Use secure storage (Keychain, Keystore)
- **Never** store tokens in localStorage or sessionStorage

### Password Requirements

- Minimum 12 characters
- Require uppercase, lowercase, numbers, and special characters
- Check against common passwords
- Enforce password history

### Rate Limiting

- Login attempts: 5 per minute per IP
- Token refresh: 10 per minute per user
- Password reset: 3 per hour per user

## OAuth 2.0 Integration

### Supported Providers

- Google
- GitHub
- Microsoft
- Custom OAuth2

### OAuth Flow

```mermaid
sequenceDiagram
    participant User
    participant Client
    participant API
    participant OAuthProvider
    
    User->>Client: Click "Login with Provider"
    Client->>OAuthProvider: Redirect to OAuth login
    User->>OAuthProvider: Authenticate & authorize
    OAuthProvider->>Client: Redirect with code
    Client->>API: POST /api/auth/oauth/callback
    Note over Client,API: {provider, code, redirectUri}
    API->>OAuthProvider: Exchange code for token
    OAuthProvider-->>API: Access token & user info
    API-->>Client: 200 OK {accessToken, refreshToken, user}
```

## Multi-Factor Authentication (MFA)

### Supported Methods

1. **TOTP** (Time-based One-Time Password)
2. **SMS** (Twilio, etc.)
3. **Email**
4. **Security Keys** (WebAuthn)

### MFA Flow

1. User enables MFA in account settings
2. System generates a secret and shows QR code
3. User scans with authenticator app
4. For each login after password:
   - User enters TOTP code
   - System verifies and grants access

## Session Management

### Active Sessions

List and manage active sessions:

```http
GET /api/auth/sessions
```

**Response**
```json
{
  "sessions": [
    {
      "id": "session-123",
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0...",
      "lastActive": "2023-01-01T12:00:00.000Z",
      "current": true
    }
  ]
}
```

### Revoke Session

```http
DELETE /api/auth/sessions/:sessionId
```

## Password Reset

### Request Password Reset

```http
POST /api/auth/forgot-password
```

**Request Body**
```json
{
  "email": "user@example.com"
}
```

### Reset Password

```http
POST /api/auth/reset-password
```

**Request Body**
```json
{
  "token": "reset-token-from-email",
  "password": "new-secure-password",
  "confirmPassword": "new-secure-password"
}
```

## Best Practices

1. Always use HTTPS
2. Implement CSRF protection
3. Set secure cookie flags
4. Rotate refresh tokens
5. Monitor for suspicious activity
6. Log security events
7. Implement account lockout after failed attempts
8. Regularly rotate secrets and keys
