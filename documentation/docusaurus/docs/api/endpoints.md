---
title: API Endpoints
description: Detailed documentation of all available API endpoints
---

# API Endpoints

This document provides detailed information about all available API endpoints in the SaaS BI Platform.

## Authentication

### Login

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

## Users

### Get Current User

```http
GET /api/users/me
```

**Response**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "admin",
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

### Update User

```http
PATCH /api/users/me
```

**Request Body**
```json
{
  "firstName": "John Updated",
  "lastName": "Doe Updated"
}
```

**Response**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "firstName": "John Updated",
  "lastName": "Doe Updated",
  "role": "admin",
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-10T00:00:00.000Z"
}
```

## Dashboards

### List Dashboards

```http
GET /api/dashboards
```

**Query Parameters**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)
- `sort` (string): Sort field (e.g., `-createdAt`)
- `isPublic` (boolean): Filter by public/private

**Response**
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "Sales Dashboard",
      "description": "Monthly sales overview",
      "isPublic": false,
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 20,
    "pages": 1
  }
}
```

### Get Dashboard

```http
GET /api/dashboards/:id
```

**Response**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "name": "Sales Dashboard",
  "description": "Monthly sales overview",
  "isPublic": false,
  "layout": {},
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z",
  "widgets": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "type": "line_chart",
      "title": "Monthly Sales",
      "config": {},
      "data": {},
      "x": 0,
      "y": 0,
      "width": 6,
      "height": 4
    }
  ]
}
```

### Create Dashboard

```http
POST /api/dashboards
```

**Request Body**
```json
{
  "name": "New Dashboard",
  "description": "Dashboard description",
  "isPublic": false,
  "layout": {}
}
```

**Response**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440002",
  "name": "New Dashboard",
  "description": "Dashboard description",
  "isPublic": false,
  "layout": {},
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

## Widgets

### Create Widget

```http
POST /api/dashboards/:dashboardId/widgets
```

**Request Body**
```json
{
  "type": "line_chart",
  "title": "Monthly Sales",
  "config": {},
  "dataSourceId": "770e8400-e29b-41d4-a716-446655440001",
  "x": 0,
  "y": 0,
  "width": 6,
  "height": 4
}
```

**Response**
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440002",
  "type": "line_chart",
  "title": "Monthly Sales",
  "config": {},
  "data": {},
  "dashboardId": "550e8400-e29b-41d4-a716-446655440001",
  "dataSourceId": "770e8400-e29b-41d4-a716-446655440001",
  "x": 0,
  "y": 0,
  "width": 6,
  "height": 4,
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

## Data Sources

### List Data Sources

```http
GET /api/data-sources
```

**Response**
```json
{
  "data": [
    {
      "id": "770e8400-e29b-41d4-a716-446655440001",
      "name": "PostgreSQL Production",
      "type": "postgresql",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 20,
    "pages": 1
  }
}
```

### Test Data Source Connection

```http
POST /api/data-sources/test-connection
```

**Request Body**
```json
{
  "type": "postgresql",
  "connection": {
    "host": "localhost",
    "port": 5432,
    "database": "mydb",
    "username": "user",
    "password": "password"
  }
}
```

**Response**
```json
{
  "success": true,
  "message": "Connection successful"
}
```

## Error Handling

All error responses follow the same format:

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
    ]
  }
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| `invalid_credentials` | Invalid email or password |
| `unauthorized` | Authentication required |
| `forbidden` | Insufficient permissions |
| `not_found` | Resource not found |
| `validation_error` | Request validation failed |
| `rate_limit_exceeded` | Too many requests |
| `internal_server_error` | Something went wrong |

## Webhooks

### Available Events

- `dashboard.created`
- `dashboard.updated`
- `dashboard.deleted`
- `widget.created`
- `widget.updated`
- `widget.deleted`

### Webhook Payload Example

```json
{
  "event": "dashboard.created",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "New Dashboard",
    "createdBy": "550e8400-e29b-41d4-a716-446655440000"
  },
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```
