---
title: Authentication & Authorization
description: User authentication and access control in the SaaS BI Platform
---

# Authentication & Authorization

This guide explains the authentication and authorization mechanisms used in the SaaS BI Platform.

## Authentication

The platform uses JSON Web Tokens (JWT) for authentication. When a user logs in, they receive a JWT that must be included in subsequent requests.

### Login Flow

1. User submits credentials (email/password)
2. Server verifies credentials against the database
3. If valid, issues a JWT token
4. Token is stored in an HTTP-only cookie for web clients

### Token Management

- **Access Token**: Short-lived (15 minutes by default)
- **Refresh Token**: Longer-lived (7 days by default)
- **Token Rotation**: Refresh tokens are rotated on use

## Authorization

### Roles and Permissions

The platform uses role-based access control (RBAC) with the following default roles:

| Role | Description |
|------|-------------|
| Admin | Full access to all features and settings |
| Editor | Can create and edit dashboards and reports |
| Viewer | Can view dashboards and reports |
| Guest | Limited access to public dashboards |

### Permission Levels

1. **Global Permissions**: Apply across the entire application
2. **Dashboard Permissions**: Control access to specific dashboards
3. **Widget Permissions**: Control access to individual widgets

## User Management

### Creating Users

Admins can create new users through the admin panel or API:

1. Navigate to **Settings > Users**
2. Click **Add User**
3. Fill in user details and assign roles
4. Send invitation email

### Managing Permissions

1. Go to **Settings > Permissions**
2. Select a user or role
3. Update permissions as needed
4. Click **Save Changes**

## Security Best Practices

### Password Policies

- Minimum 12 characters
- Require uppercase, lowercase, numbers, and special characters
- Password history (prevent reuse of last 5 passwords)
- Account lockout after 5 failed attempts

### Session Management

- Invalidate sessions on password reset
- Allow users to view and revoke active sessions
- Automatic session timeout after 24 hours of inactivity

## API Authentication

For API access, include the JWT in the `Authorization` header:

```http
GET /api/v1/dashboards
Authorization: Bearer your-jwt-token-here
```

## Troubleshooting

### Common Issues

1. **Invalid Token**
   - Token may have expired
   - Try refreshing the page to get a new token

2. **Permission Denied**
   - Verify user has the required role/permissions
   - Check dashboard/widget permissions

3. **Session Expired**
   - User will need to log in again
   - Consider increasing session duration if needed

## Next Steps

- [User Management API](/docs/api/user-management)
- [Security Best Practices](/docs/guides/security)
- [API Documentation](/docs/category/api-reference)
