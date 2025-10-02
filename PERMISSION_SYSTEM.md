# Permission System Documentation

## Overview
This document describes the role-based access control (RBAC) and permission system implemented in PowerLink.

## User Roles

### Admin
- **Full Access**: Admins have unrestricted access to all features
- **Bypass Permissions**: Admins automatically bypass all permission checks
- **User Management**: Can approve/reject users and assign permissions
- **First User**: The first registered user is automatically an admin

### Viewer
- **Controlled Access**: Viewers have restricted access based on assigned permissions
- **Requires Approval**: New viewers must be approved by an admin before login
- **Custom Permissions**: Admins can grant specific permissions to each viewer

## Permission Types

### 1. canRead
- **Purpose**: View and read data across all modules
- **Default**: `false` for new users, `true` when approved
- **Protected Routes**: GET requests (automatically allowed with authentication)

### 2. canWrite
- **Purpose**: Create and modify data
- **Default**: `false` for new users
- **Protected Routes**: 
  - POST `/api/workers` (Create worker)
  - PUT `/api/workers/:id` (Update worker)
  - POST `/api/loans` (Create loan)
  - PUT `/api/loans/:id` (Update loan)
  - POST `/api/installments` (Create installment)
  - PUT `/api/installments/:id` (Update installment)
  - POST `/api/expenses` (Create expense)
  - PUT `/api/expenses/:id` (Update expense)
  - POST `/api/baana` (Create baana)
  - PUT `/api/baana/:id` (Update baana)
  - POST `/api/beam` (Create beam)
  - PUT `/api/beam/:id` (Update beam)

### 3. canDelete
- **Purpose**: Delete data from the system
- **Default**: `false` for new users
- **Protected Routes**:
  - DELETE `/api/workers/:id`
  - DELETE `/api/loans/:id`
  - DELETE `/api/installments/:id`
  - DELETE `/api/expenses/:id`
  - DELETE `/api/baana/:id`
  - DELETE `/api/beam/:id`

### 4. canExport
- **Purpose**: Export data to external formats
- **Default**: `false` for new users
- **Protected Routes**: Any export functionality (to be implemented)

## How It Works

### JWT Token Payload
Access tokens now include user permissions:
```javascript
{
  sub: "userId",           // User ID
  role: "admin|viewer",    // User role
  tv: 1,                   // Token version
  permissions: {
    canRead: true,
    canWrite: false,
    canDelete: false,
    canExport: false
  }
}
```

### Middleware Functions

#### `requireAuth`
- Validates JWT token
- Sets `req.user` with token payload (including permissions)
- Used on all protected routes

#### `requireWrite`
- Checks if user can create/modify data
- Admins bypass this check
- Returns 403 if user lacks `canWrite` permission

#### `requireDelete`
- Checks if user can delete data
- Admins bypass this check
- Returns 403 if user lacks `canDelete` permission

#### `requireExport`
- Checks if user can export data
- Admins bypass this check
- Returns 403 if user lacks `canExport` permission

### Permission Enforcement Flow

1. **User Login**: JWT token generated with current permissions
2. **API Request**: Token sent in Authorization header
3. **Route Middleware**: `requireAuth` validates token and extracts permissions
4. **Permission Check**: Route-specific middleware checks required permission
5. **Grant/Deny**: Request proceeds or returns 403 Forbidden

### Token Invalidation

When admin updates user permissions:
- User's `tokenVersion` is incremented
- Old tokens become invalid
- User must refresh to get new token with updated permissions

## Admin Actions

### Approve User
```javascript
POST /api/admin/users/:userId/approve
Body: {
  permissions: {
    canRead: true,
    canWrite: true,
    canDelete: false,
    canExport: false
  },
  role: "viewer" // optional
}
```
- Sets `accountStatus` to 'approved'
- Assigns permissions
- Invalidates old tokens

### Update Permissions
```javascript
PUT /api/admin/users/:userId/permissions
Body: {
  permissions: {
    canRead: true,
    canWrite: true,
    canDelete: true,
    canExport: true
  },
  role: "admin" // optional
}
```
- Updates user permissions
- Invalidates old tokens

## Security Features

### 1. Automatic Admin Bypass
Admins don't need permission checks - they have full access:
```javascript
if (req.user.role === 'admin') return next();
```

### 2. Token Refresh with Permissions
Refresh endpoint always includes latest permissions from database:
```javascript
const accessToken = signAccessToken({ 
  sub: user._id.toString(), 
  role: user.role, 
  tv: user.tokenVersion,
  permissions: user.permissions
});
```

### 3. Permission Validation
All write/delete operations validate permissions before execution:
```javascript
// Example: Creating a worker
router.post('/', requireWrite, createWorker);
```

## Error Messages

### 403 Forbidden Responses
- **No Write Permission**: "You do not have permission to modify data"
- **No Delete Permission**: "You do not have permission to delete data"
- **No Export Permission**: "You do not have permission to export data"

### 401 Unauthorized Responses
- **Missing Token**: "Missing token"
- **Invalid Token**: "Invalid or expired token"
- **Account Pending**: "Your account is pending admin approval"
- **Account Rejected**: "Your account request was rejected"

## Testing Checklist

### As Admin
- ✅ Can view all data (GET requests)
- ✅ Can create all data (POST requests)
- ✅ Can update all data (PUT requests)
- ✅ Can delete all data (DELETE requests)
- ✅ Can access admin panel
- ✅ Can approve/reject users
- ✅ Can update user permissions

### As Viewer (Read-Only)
- ✅ Can view all data (GET requests)
- ❌ Cannot create data (POST requests) - 403 Forbidden
- ❌ Cannot update data (PUT requests) - 403 Forbidden
- ❌ Cannot delete data (DELETE requests) - 403 Forbidden
- ❌ Cannot access admin panel

### As Viewer (Read + Write)
- ✅ Can view all data (GET requests)
- ✅ Can create data (POST requests)
- ✅ Can update data (PUT requests)
- ❌ Cannot delete data (DELETE requests) - 403 Forbidden
- ❌ Cannot access admin panel

### As Viewer (Full Permissions)
- ✅ Can view all data (GET requests)
- ✅ Can create data (POST requests)
- ✅ Can update data (PUT requests)
- ✅ Can delete data (DELETE requests)
- ❌ Cannot access admin panel (role restriction)

## Implementation Files

### Backend
- `server/src/middlewares/auth.js` - Permission middleware functions
- `server/src/controllers/auth.controller.js` - Token generation with permissions
- `server/src/routes/*.routes.js` - Route-level permission checks
- `server/src/routes/admin.routes.js` - Admin user management
- `server/src/models/User.js` - User schema with permissions

### Database Schema
```javascript
permissions: {
  canRead: { type: Boolean, default: false },
  canWrite: { type: Boolean, default: false },
  canDelete: { type: Boolean, default: false },
  canExport: { type: Boolean, default: false }
}
```

## Future Enhancements

1. **Module-Level Permissions**: Restrict access to specific modules (Workers, Loans, etc.)
2. **Export Functionality**: Implement actual export features with `requireExport` middleware
3. **Permission Templates**: Predefined permission sets for common roles
4. **Audit Logging**: Track permission changes and denied access attempts
5. **Time-Based Permissions**: Temporary access grants with expiration

## Backward Compatibility

✅ **All existing APIs preserved**
- No breaking changes to API endpoints
- Existing functionality remains intact
- Only adds permission validation layer

## Notes

- First registered user is automatically admin with all permissions
- Subsequent users require admin approval
- Permission changes require token refresh
- Admins always bypass permission checks
- Viewers need explicit permission grants
