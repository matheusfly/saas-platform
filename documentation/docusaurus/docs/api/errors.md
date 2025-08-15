---
title: API Errors
description: Comprehensive guide to error handling in the API
---

# Error Handling

This document provides detailed information about error responses and how to handle them when working with the SaaS BI Platform API.

## Error Response Format

All error responses follow this format:

```json
{
  "error": {
    "code": "error_code",
    "message": "Human-readable error message",
    "details": [
      {
        "field": "field_name",
        "message": "Validation error message"
      }
    ],
    "documentation_url": "https://docs.example.com/api/errors/error_code"
  }
}
```

## Standard Error Codes

### 400 Bad Request

| Code | Description |
|------|-------------|
| `validation_error` | Request validation failed |
| `invalid_json` | Invalid JSON in request body |
| `invalid_parameters` | One or more parameters are invalid |
| `missing_required_field` | A required field is missing |
| `invalid_field_type` | Field has an invalid type |

### 401 Unauthorized

| Code | Description |
|------|-------------|
| `invalid_credentials` | Invalid email or password |
| `invalid_token` | Invalid or malformed token |
| `token_expired` | Token has expired |
| `refresh_token_expired` | Refresh token has expired |

### 403 Forbidden

| Code | Description |
|------|-------------|
| `insufficient_permissions` | User lacks required permissions |
| `account_locked` | Account has been locked |
| `ip_blocked` | IP address has been blocked |

### 404 Not Found

| Code | Description |
|------|-------------|
| `resource_not_found` | Requested resource not found |
| `route_not_found` | API endpoint does not exist |
| `user_not_found` | User account not found |

### 409 Conflict

| Code | Description |
|------|-------------|
| `resource_exists` | Resource already exists |
| `concurrent_modification` | Resource was modified by another request |
| `conflict` | Operation conflicts with existing state |

### 422 Unprocessable Entity

| Code | Description |
|------|-------------|
| `validation_failed` | Request validation failed |
| `invalid_input` | Input data is invalid |
| `business_rule_violation` | Business rule validation failed |

### 429 Too Many Requests

| Code | Description |
|------|-------------|
| `rate_limit_exceeded` | Too many requests, please try again later |
| `quota_exceeded` | API quota exceeded |

### 500 Internal Server Error

| Code | Description |
|------|-------------|
| `internal_error` | An unexpected error occurred |
| `service_unavailable` | Service is temporarily unavailable |
| `database_error` | Database operation failed |

## Error Handling Best Practices

1. **Check the status code** - The HTTP status code provides the general category of error.
2. **Inspect the error code** - The `code` field provides a machine-readable error identifier.
3. **Read the message** - The `message` field contains a human-readable explanation.
4. **Check for details** - The `details` array may contain specific validation errors.
5. **Follow the documentation URL** - When available, visit the URL for more information.

## Example Error Responses

### Validation Error

```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "error": {
    "code": "validation_error",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Must be a valid email address"
      },
      {
        "field": "password",
        "message": "Must be at least 8 characters"
      }
    ],
    "documentation_url": "https://docs.example.com/api/errors/validation_error"
  }
}
```

### Authentication Error

```http
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{
  "error": {
    "code": "invalid_credentials",
    "message": "Invalid email or password",
    "documentation_url": "https://docs.example.com/api/errors/invalid_credentials"
  }
}
```

### Permission Error

```http
HTTP/1.1 403 Forbidden
Content-Type: application/json

{
  "error": {
    "code": "insufficient_permissions",
    "message": "You don't have permission to access this resource",
    "documentation_url": "https://docs.example.com/api/errors/insufficient_permissions"
  }
}
```

## Rate Limiting

When rate limited, the API will respond with:

```http
HTTP/1.1 429 Too Many Requests
Content-Type: application/json
Retry-After: 60
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1617240000

{
  "error": {
    "code": "rate_limit_exceeded",
    "message": "Rate limit exceeded. Please try again in 60 seconds.",
    "retry_after": 60,
    "documentation_url": "https://docs.example.com/api/rate-limiting"
  }
}
```

## Retry Logic

For transient errors (5xx), implement exponential backoff:

```javascript
async function fetchWithRetry(url, options = {}, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;
      
      const error = await response.json().catch(() => ({}));
      if (response.status < 500) throw error;
      
      // Exponential backoff: 1s, 2s, 4s, etc.
      const delay = 1000 * Math.pow(2, i);
      await new Promise(resolve => setTimeout(resolve, delay));
    } catch (error) {
      if (i === retries - 1) throw error;
    }
  }
  throw new Error('Max retries exceeded');
}
```

## Error Recovery

1. **Temporary Failures** (5xx): Retry with exponential backoff
2. **Rate Limits** (429): Wait and retry after the specified delay
3. **Validation Errors** (400/422): Fix the request and try again
4. **Authentication Errors** (401): Refresh the access token or re-authenticate
5. **Permission Errors** (403): Verify user permissions or contact support
6. **Not Found** (404): Verify the resource ID and try again

## Monitoring and Alerts

Monitor for these error patterns:

- Sudden increase in 5xx errors
- Repeated authentication failures
- Rate limit warnings
- Failed validations for required fields
- Database connection issues

## Testing Error Conditions

When testing your integration, verify handling of:

- Network timeouts
- Invalid JSON responses
- Missing or malformed error responses
- Rate limiting
- Authentication token expiration
- Service unavailability
