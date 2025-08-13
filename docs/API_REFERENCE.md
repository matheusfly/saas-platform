# 📚 API Reference

## Base URL
```
https://api.your-saas-app.com/v1
```

## Table of Contents
- [Authentication](#-authentication)
- [Error Handling](#-error-handling)
- [Rate Limiting](#-rate-limiting)
- [Pagination](#-pagination)
- [Filtering & Sorting](#-filtering--sorting)
- [Endpoints](#-endpoints)

## 🔐 Authentication

### Request Headers
```http
Authorization: Bearer <access_token>
Content-Type: application/json
X-API-Version: 1.0
```

### Authentication Flow
1. **Login** to obtain access and refresh tokens
2. Include the access token in the `Authorization` header for all authenticated requests
3. When the access token expires (after 1 hour), use the refresh token to obtain a new access token

### Scopes
- `read:profile` - Read user profile information
- `write:profile` - Update user profile
- `read:reports` - View reports
- `write:reports` - Create/update reports
- `admin:all` - Full administrative access

## ⚠ Error Handling

### HTTP Status Codes

| Code | Status | Description |
|------|--------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 204 | No Content | Request successful, no content to return |
| 400 | Bad Request | Invalid request format or parameters |
| 401 | Unauthorized | Authentication required or failed |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists |
| 422 | Unprocessable Entity | Validation errors |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

### Error Response Format
```json
{
  "error": {
    "code": "validation_error",
    "message": "Validation failed",
    "details": {
      "email": ["Must be a valid email address"],
      "password": ["Must be at least 8 characters"]
    },
    "request_id": "req_1234567890abcdef",
    "documentation_url": "https://docs.example.com/errors/validation_error"
  }
}
```

### Common Error Codes

| Code | Description | Resolution |
|------|-------------|------------|
| `invalid_token` | Invalid or expired token | Re-authenticate |
| `insufficient_scope` | Missing required permissions | Check user roles |
| `rate_limit_exceeded` | Too many requests | Wait and retry |
| `validation_error` | Invalid request data | Check error details |
| `resource_not_found` | Requested resource doesn't exist | Verify resource ID |

## 🔄 Rate Limiting

### Rate Limits
- **Authenticated Users**: 100 requests/minute
- **Unauthenticated**: 10 requests/minute
- **Burst Capacity**: 2x the normal limit for 5 seconds

### Rate Limit Headers
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1617185200
Retry-After: 60  # Only present when rate limited
```

### Handling Rate Limits
1. Check `X-RateLimit-Remaining` header
2. When approaching the limit, implement exponential backoff
3. If rate limited (`429`), wait for the duration specified in `Retry-After`

## 📑 Pagination

### Request Parameters
- `page` - Page number (default: 1)
- `per_page` - Items per page (default: 20, max: 100)

### Response Headers
```http
X-Page: 1
X-Per-Page: 20
X-Total-Count: 150
X-Total-Pages: 8
Link: </api/v1/resource?page=2>; rel="next", </api/v1/resource?page=8>; rel="last"
```

### Example
```http
GET /api/v1/users?page=2&per_page=10
```

## 🔍 Filtering & Sorting

### Filtering
Use query parameters to filter results:
```
GET /api/v1/users?status=active&role=admin
```

### Advanced Filtering
```
GET /api/v1/users?filter[status]=active&filter[created_at][gte]=2023-01-01
```

### Sorting
```
GET /api/v1/users?sort=-created_at,email
```
- Prefix with `-` for descending order
- Multiple fields separated by comma

## 🚀 Endpoints

### Authentication

#### Login
```http
POST /auth/login
```

**Request Body**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 3600,
  "token_type": "Bearer"
}
```

**Error Responses**
- `400 Bad Request`: Invalid request format
- `401 Unauthorized`: Invalid credentials
- `429 Too Many Requests`: Rate limit exceeded

#### Refresh Token
```http
POST /auth/refresh
```

**Request Headers**
```
Authorization: Bearer <refresh_token>
```

**Response**
```json
{
  "access_token": "new_access_token_here",
  "expires_in": 3600,
  "token_type": "Bearer"
}
```

**Error Responses**
- `400 Bad Request`: Missing or invalid refresh token
- `401 Unauthorized`: Invalid or expired refresh token

### Users

#### Get Current User
```http
GET /users/me
```

**Headers**
```
Authorization: Bearer <access_token>
```

**Response**
```json
{
  "id": "usr_1234567890",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "admin",
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-01T00:00:00Z"
}
```

**Error Responses**
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: Insufficient permissions

#### Update User
```http
PATCH /users/me
```

**Headers**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body**
```json
{
  "name": "John Updated",
  "email": "updated@example.com"
}
```

**Response**
```json
{
  "id": "usr_1234567890",
  "email": "updated@example.com",
  "name": "John Updated",
  "role": "admin",
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-02-01T00:00:00Z"
}
```

### Dashboards

#### List Dashboards
```http
GET /dashboards
```

**Query Parameters**
- `page`: Page number (default: 1)
- `per_page`: Items per page (default: 20, max: 100)
- `sort`: Sort field (e.g., `-created_at` for descending)

**Headers**
```
Authorization: Bearer <access_token>
```

**Response**
```json
{
  "data": [
    {
      "id": "dash_1234567890",
      "name": "Sales Overview",
      "description": "Key sales metrics and trends",
      "is_public": false,
      "created_at": "2023-01-01T00:00:00Z",
      "updated_at": "2023-01-01T00:00:00Z"
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "per_page": 20,
    "total_pages": 1
  }
}
```

#### Get Dashboard
```http
GET /dashboards/{id}
```

**Path Parameters**
- `id`: Dashboard ID (required)

**Headers**
```
Authorization: Bearer <access_token>
```

**Response**
```json
{
  "id": "dash_1234567890",
  "name": "Sales Overview",
  "description": "Key sales metrics and trends",
  "is_public": false,
  "widgets": [
    {
      "id": "wgt_1234567890",
      "type": "line_chart",
      "title": "Monthly Sales",
      "position": 1,
      "config": {
        "data_source": "sales_monthly",
        "x_axis": "month",
        "y_axis": "revenue"
      }
    }
  ],
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-01T00:00:00Z"
}
```

**Error Responses**
- `404 Not Found`: Dashboard not found or no access
- `401 Unauthorized`: Missing or invalid token

### Widgets

#### Create Widget
```http
POST /dashboards/{dashboard_id}/widgets
```

**Headers**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body**
```json
{
  "type": "bar_chart",
  "title": "Top Products",
  "position": 2,
  "config": {
    "data_source": "top_products",
    "x_axis": "product_name",
    "y_axis": "quantity_sold"
  }
}
```

**Response**
```json
{
  "id": "wgt_1234567891",
  "type": "bar_chart",
  "title": "Top Products",
  "position": 2,
  "config": {
    "data_source": "top_products",
    "x_axis": "product_name",
    "y_axis": "quantity_sold"
  },
  "created_at": "2023-01-02T00:00:00Z",
  "updated_at": "2023-01-02T00:00:00Z"
}
```

**Error Responses**
- `400 Bad Request`: Invalid widget configuration
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: No permission to modify dashboard
- `404 Not Found`: Dashboard not found
  "token_type": "Bearer"
}
```

### Users

#### Get Current User
```http
GET /users/me
```

**Response**
```json
{
  "id": "usr_1234567890",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "admin",
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-01T00:00:00Z"
}
```

#### Update Current User
```http
PATCH /users/me
```

**Request Body**
```json
{
  "name": "John Updated",
  "email": "new.email@example.com"
}
```

**Response**
```json
{
  "id": "usr_1234567890",
  "email": "new.email@example.com",
  "name": "John Updated",
  "role": "admin",
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-02T12:00:00Z"
}
```

### Dashboards

#### List Dashboards
```http
GET /dashboards
```

**Query Parameters**
- `limit` (number, optional, default: 20)
- `offset` (number, optional, default: 0)
- `sort` (string, optional, default: "-created_at")
- `search` (string, optional)

**Response**
```json
{
  "data": [
    {
      "id": "dash_1234567890",
      "name": "Sales Overview",
      "description": "Key sales metrics and trends",
      "is_public": false,
      "created_at": "2023-01-01T00:00:00Z",
      "updated_at": "2023-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "total": 1,
    "limit": 20,
    "offset": 0
  }
}
```

#### Create Dashboard
```http
POST /dashboards
```

**Request Body**
```json
{
  "name": "New Dashboard",
  "description": "Dashboard description",
  "is_public": false
}
```

**Response**
```json
{
  "id": "dash_1234567890",
  "name": "New Dashboard",
  "description": "Dashboard description",
  "is_public": false,
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-01T00:00:00Z"
}
```

#### Get Dashboard
```http
GET /dashboards/:id
```

**Response**
```json
{
  "id": "dash_1234567890",
  "name": "Sales Overview",
  "description": "Key sales metrics and trends",
  "is_public": false,
  "widgets": [
    {
      "id": "wgt_1234567890",
      "type": "line_chart",
      "title": "Monthly Sales",
      "position": {
        "x": 0,
        "y": 0,
        "w": 6,
        "h": 4
      },
      "options": {
        "x_axis": "month",
        "y_axis": "sales",
        "color": "#4f46e5"
      },
      "data": [
        { "month": "Jan", "sales": 1000 },
        { "month": "Feb", "sales": 1500 },
        { "month": "Mar", "sales": 2000 }
      ]
    }
  ],
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-01T00:00:00Z"
}
```

### Widgets

#### Create Widget
```http
POST /dashboards/:dashboard_id/widgets
```

**Request Body**
```json
{
  "type": "bar_chart",
  "title": "Top Products",
  "position": {
    "x": 6,
    "y": 0,
    "w": 6,
    "h": 4
  },
  "options": {
    "x_axis": "product",
    "y_axis": "revenue",
    "color": "#10b981"
  },
  "query_id": "qry_1234567890"
}
```

**Response**
```json
{
  "id": "wgt_1234567891",
  "type": "bar_chart",
  "title": "Top Products",
  "position": {
    "x": 6,
    "y": 0,
    "w": 6,
    "h": 4
  },
  "options": {
    "x_axis": "product",
    "y_axis": "revenue",
    "color": "#10b981"
  },
  "data": [
    { "product": "Product A", "revenue": 5000 },
    { "product": "Product B", "revenue": 3000 },
    { "product": "Product C", "revenue": 2000 }
  ],
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-01T00:00:00Z"
}
```

#### Update Widget
```http
PATCH /dashboards/:dashboard_id/widgets/:widget_id
```

**Request Body**
```json
{
  "title": "Updated Widget Title",
  "position": {
    "x": 0,
    "y": 4,
    "w": 12,
    "h": 4
  }
}
```

**Response**
```json
{
  "id": "wgt_1234567891",
  "type": "bar_chart",
  "title": "Updated Widget Title",
  "position": {
    "x": 0,
    "y": 4,
    "w": 12,
    "h": 4
  },
  "options": {
    "x_axis": "product",
    "y_axis": "revenue",
    "color": "#10b981"
  },
  "data": [
    { "product": "Product A", "revenue": 5000 },
    { "product": "Product B", "revenue": 3000 },
    { "product": "Product C", "revenue": 2000 }
  ],
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-02T12:00:00Z"
}
```

#### Delete Widget
```http
DELETE /dashboards/:dashboard_id/widgets/:widget_id
```

**Response**
```
204 No Content
```

### Data Sources

#### List Data Sources
```http
GET /data-sources
```

**Response**
```json
{
  "data": [
    {
      "id": "src_1234567890",
      "name": "Production Database",
      "type": "postgres",
      "connection": {
        "host": "db.example.com",
        "port": 5432,
        "database": "production"
      },
      "created_at": "2023-01-01T00:00:00Z",
      "updated_at": "2023-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "total": 1,
    "limit": 20,
    "offset": 0
  }
}
```

#### Create Data Source
```http
POST /data-sources
```

**Request Body**
```json
{
  "name": "Analytics Warehouse",
  "type": "bigquery",
  "connection": {
    "project_id": "my-project",
    "dataset": "analytics",
    "credentials": "{\"type\":\"service_account\",...}"
  }
}
```

**Response**
```json
{
  "id": "src_1234567891",
  "name": "Analytics Warehouse",
  "type": "bigquery",
  "connection": {
    "project_id": "my-project",
    "dataset": "analytics"
  },
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-01T00:00:00Z"
}
```

### Queries

#### Execute Query
```http
POST /queries/execute
```

**Request Body**
```json
{
  "data_source_id": "src_1234567890",
  "query": "SELECT * FROM sales WHERE date >= :start_date AND date <= :end_date",
  "parameters": {
    "start_date": "2023-01-01",
    "end_date": "2023-01-31"
  }
}
```

**Response**
```json
{
  "columns": [
    { "name": "date", "type": "date" },
    { "name": "product", "type": "string" },
    { "name": "revenue", "type": "number" },
    { "name": "quantity", "type": "number" }
  ],
  "rows": [
    {
      "date": "2023-01-01",
      "product": "Product A",
      "revenue": 1000,
      "quantity": 10
    },
    {
      "date": "2023-01-15",
      "product": "Product B",
      "revenue": 2000,
      "quantity": 20
    }
  ],
  "stats": {
    "row_count": 2,
    "bytes_processed": 1024,
    "execution_time_ms": 150
  }
}
```

#### Save Query
```http
POST /queries
```

**Request Body**
```json
{
  "name": "Monthly Sales Report",
  "description": "Sales data aggregated by month",
  "data_source_id": "src_1234567890",
  "query": "SELECT date_trunc('month', date) as month, SUM(revenue) as total_revenue FROM sales GROUP BY 1 ORDER BY 1",
  "parameters": {},
  "tags": ["sales", "monthly"]
}
```

**Response**
```json
{
  "id": "qry_1234567890",
  "name": "Monthly Sales Report",
  "description": "Sales data aggregated by month",
  "data_source_id": "src_1234567890",
  "query": "SELECT date_trunc('month', date) as month, SUM(revenue) as total_revenue FROM sales GROUP BY 1 ORDER BY 1",
  "parameters": {},
  "tags": ["sales", "monthly"],
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-01T00:00:00Z"
}
```

## WebSocket API

### Connection
```
wss://api.your-saas-app.com/v1/realtime
```

### Authentication
Include the JWT token in the URL when connecting:
```
wss://api.your-saas-app.com/v1/realtime?token=<access_token>
```

### Events

#### Subscribe to Dashboard Updates
```json
{
  "event": "subscribe",
  "channel": "dashboard",
  "id": "dash_1234567890"
}
```

#### Unsubscribe from Dashboard Updates
```json
{
  "event": "unsubscribe",
  "channel": "dashboard",
  "id": "dash_1234567890"
}
```

#### Dashboard Updated Event
```json
{
  "event": "dashboard.updated",
  "data": {
    "id": "dash_1234567890",
    "name": "Updated Dashboard Name",
    "updated_at": "2023-01-01T00:00:00Z"
  }
}
```

#### Widget Data Updated Event
```json
{
  "event": "widget.updated",
  "data": {
    "id": "wgt_1234567890",
    "dashboard_id": "dash_1234567890",
    "type": "line_chart",
    "data": [
      { "month": "Jan", "sales": 1200 },
      { "month": "Feb", "sales": 1800 },
      { "month": "Mar", "sales": 2200 }
    ],
    "updated_at": "2023-01-01T00:00:00Z"
  }
}
```

## Webhooks

### Available Events
- `dashboard.created`
- `dashboard.updated`
- `dashboard.deleted`
- `widget.created`
- `widget.updated`
- `widget.deleted`
- `data_source.connected`
- `data_source.disconnected`
- `query.executed`
- `query.failed`

### Webhook Payload Example
```json
{
  "event": "dashboard.updated",
  "data": {
    "id": "dash_1234567890",
    "name": "Updated Dashboard",
    "description": "Updated description",
    "is_public": false,
    "updated_at": "2023-01-02T12:00:00Z"
  },
  "timestamp": "2023-01-02T12:00:00Z"
}
```

## SDKs

### JavaScript/TypeScript
```javascript
import { DashboardClient } from '@your-saas-app/sdk';

const client = new DashboardClient({
  apiKey: 'your_api_key',
  baseUrl: 'https://api.your-saas-app.com/v1'
});

// Get dashboard
const dashboard = await client.dashboards.get('dash_1234567890');

// Update dashboard
const updated = await client.dashboards.update('dash_1234567890', {
  name: 'Updated Dashboard Name'
});

// Execute query
const results = await client.queries.execute({
  dataSourceId: 'src_1234567890',
  query: 'SELECT * FROM sales LIMIT 10'
});
```

### Python
```python
from your_saas_app import DashboardClient

client = DashboardClient(api_key='your_api_key')

# Get dashboard
dashboard = client.dashboards.get('dash_1234567890')

# Update dashboard
updated = client.dashboards.update('dash_1234567890', {
    'name': 'Updated Dashboard Name'
})

# Execute query
results = client.queries.execute({
    'data_source_id': 'src_1234567890',
    'query': 'SELECT * FROM sales LIMIT 10'
})
```

## Changelog

### v1.0.0 (2023-01-01)
- Initial release of the API
- Support for dashboards, widgets, and data sources
- Real-time updates via WebSocket
- Webhook notifications

## Support
For API support, please contact api-support@your-saas-app.com or visit our [API documentation](https://docs.your-saas-app.com/api).
