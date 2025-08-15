---
title: API Overview
description: Introduction to the SaaS BI Platform API
---

# API Reference

Welcome to the SaaS BI Platform API documentation. This API allows you to interact with the platform programmatically.

## Base URL

All API endpoints are relative to the base URL:

```
https://api.your-domain.com/v1
```

## Authentication

All API requests require authentication using a JWT token.

### Getting an Access Token

1. Make a POST request to `/api/auth/login` with your credentials:
   ```http
   POST /api/auth/login
   Content-Type: application/json
   
   {
     "email": "user@example.com",
     "password": "your-password"
   }
   ```

2. The response will include an access token:
   ```json
   {
     "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "expiresIn": 3600
   }
   ```

3. Include the access token in subsequent requests:
   ```http
   GET /api/dashboards
   Authorization: Bearer your-access-token-here
   ```

## Rate Limiting

- **Rate Limit**: 1000 requests per hour per IP
- **Authentication Required**: For all endpoints except `/api/auth/*`
- **Headers**:
  - `X-RateLimit-Limit`: Maximum number of requests allowed
  - `X-RateLimit-Remaining`: Remaining number of requests
  - `X-RateLimit-Reset`: Time when the rate limit resets (UTC timestamp)

## Pagination

List endpoints support pagination using query parameters:

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

Example:
```
GET /api/dashboards?page=2&limit=10
```

## Sorting

Most list endpoints support sorting using the `sort` parameter:

- `sort=field` - Sort ascending by `field`
- `sort=-field` - Sort descending by `field`
- `sort=field1,-field2` - Sort by multiple fields

Example:
```
GET /api/dashboards?sort=-createdAt
```

## Filtering

Filter results using query parameters:

- `field=value` - Exact match
- `field[gt]=value` - Greater than
- `field[gte]=value` - Greater than or equal
- `field[lt]=value` - Less than
- `field[lte]=value` - Less than or equal
- `field[like]=value` - Case-insensitive contains
- `field[in]=value1,value2` - In array

Example:
```
GET /api/dashboards?isPublic=true&createdAt[gte]=2023-01-01
```

## Response Format

### Success Response

```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "My Dashboard",
    "createdAt": "2023-01-01T00:00:00.000Z"
  },
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 20,
    "pages": 1
  }
}
```

### Error Response

```json
{
  "error": {
    "code": "validation_error",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Must be a valid email address"
      }
    ]
  }
}
```

## Common Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid request format |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 422 | Unprocessable Entity - Validation error |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Something went wrong |

## Versioning

API versioning is done through the URL path:

```
/v1/* - Current stable version
```

## Changelog

### v1.0.0 (2023-01-01)
- Initial release

## Support

For API support, please contact:

- **Email**: api-support@example.com
- **Documentation**: https://docs.example.com/api
- **Status Page**: https://status.example.com
