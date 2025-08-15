---
title: API Overview
description: Comprehensive guide to the SaaS BI Platform API
---

# API Reference

## Base URL

```
https://api.your-saas-platform.com/v1
```

## Authentication

All API requests require authentication using a Bearer token:

```http
Authorization: Bearer your-api-token-here
```

## Rate Limiting

- 100 requests per minute per IP address
- 1000 requests per minute per authenticated user

## Response Format

All API responses are in JSON format and include:

- `data`: The requested data
- `meta`: Metadata about the response
- `error`: Error details if the request failed

## Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Server Error |
