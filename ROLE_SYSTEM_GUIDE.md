# Role-Based Access Control System

## Overview
The online learning platform now implements a comprehensive role-based access control system with three user roles: **Student**, **Instructor**, and **Admin**.

## User Roles & Permissions

### 🎓 Student (Default Role)
- **Default role** for all new users
- Can browse and enroll in courses
- Can view materials and download content
- Can rate courses and provide feedback
- **Cannot** upload materials or create courses

### 👨‍🏫 Instructor
- Can do everything a Student can do
- **Can upload materials** (PDFs, videos, documents)
- **Can create and update courses**
- Has access to Instructor Dashboard at `/instructor`
- **Cannot** delete courses or manage user roles

### 🛡️ Admin
- **Full system access**
- Can do everything Instructors and Students can do
- **Can manage user roles** (promote Students to Instructors)
- **Can delete courses**
- Has access to Admin Panel at `/admin`
- Only `iyyappan281105@gmail.com` gets admin role automatically

## How It Works

### 1. User Registration
```javascript
// All new users get 'student' role by default
let role = 'student';
if (email === 'iyyappan281105@gmail.com') {
  role = 'admin'; // Only admin email gets special treatment
}
```

### 2. Role Promotion
- **Only Admins** can change user roles
- Done through Admin Panel → User Management
- Select new role from dropdown for any user

### 3. Access Control
- **Material Upload**: Requires `instructor` or `admin` role
- **Course Creation**: Requires `instructor` or `admin` role  
- **Course Deletion**: Requires `admin` role only
- **User Management**: Requires `admin` role only

## Navigation Based on Roles

### Students See:
- Home, Courses, About, Contact
- Dashboard (with role upgrade notice)

### Instructors See:
- Everything Students see
- **Instructor Dashboard** button
- Upload and course creation features

### Admins See:
- Everything Instructors see
- **Admin Panel** button
- User role management features

## API Endpoints & Permissions

### Public (No Auth Required)
- `GET /api/courses` - View all courses
- `GET /api/materials` - View all materials

### Authenticated Users
- `POST /api/courses/:id/enroll` - Enroll in course
- `GET /api/users/:uid` - Get user profile

### Instructor + Admin Only
- `POST /api/materials` - Upload materials
- `POST /api/courses` - Create courses
- `PUT /api/courses/:id` - Update courses

### Admin Only
- `PUT /api/users/:uid/role` - Change user roles
- `DELETE /api/courses/:id` - Delete courses
- `GET /api/users` - List all users

## Frontend Components

### New Components Added:
1. **InstructorDashboard** (`/src/pages/InstructorDashboard.js`)
   - Overview with stats
   - Material upload interface
   - Course creation interface
   - Content management

2. **InstructorRoute** (`/src/components/InstructorRoute.js`)
   - Route protection for instructor-only pages
   - Checks for `instructor` or `admin` role

3. **RoleUpgradeNotice** (`/src/components/RoleUpgradeNotice.js`)
   - Shows promotion notice to students
   - Explains instructor benefits

### Updated Components:
1. **Navigation** - Shows role-specific buttons
2. **UserManagement** - Enhanced role selection with descriptions
3. **Dashboard** - Includes role upgrade notice

## Usage Instructions

### For Students:
1. Register normally - you'll be a Student by default
2. See role upgrade notice on dashboard
3. Contact admin to become an Instructor

### For Admins:
1. Go to Admin Panel → User Management
2. Find the user you want to promote
3. Change their role from "Student" to "Instructor"
4. User will immediately get instructor permissions

### For New Instructors:
1. After role upgrade, refresh the page
2. New "Instructor" button appears in navigation
3. Access instructor dashboard to upload materials and create courses

## Security Features

- ✅ **Route Protection** - Role-based page access
- ✅ **API Authorization** - Server-side permission checks
- ✅ **Real-time Role Checking** - Dynamic navigation updates
- ✅ **Graceful Degradation** - Clear error messages for unauthorized access

## Testing the System

1. **Create a test user** (will be Student by default)
2. **Login as admin** (`iyyappan281105@gmail.com`)
3. **Promote test user** to Instructor via Admin Panel
4. **Login as test user** - should see Instructor features
5. **Try uploading materials** - should work for Instructors
6. **Try accessing admin panel** as Instructor - should be denied

The system is now fully functional with proper role-based access control! 🎉
