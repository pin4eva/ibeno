# Applicant Authentication and Dashboard

## Overview

This document describes the implementation of the applicant authentication system and student dashboard for the IBENO application system.

## Architecture

### Store Separation

The system uses separate stores for different concerns:

- **`applicant.store.ts`**: Manages applicant authentication, session, and application history
- **`application.store.ts`**: Manages application data (CRUD operations, form submissions, document uploads)

This separation provides clear boundaries between authentication/authorization and business logic.

## Features

### 1. Applicant Login (`/applications/login`)

**Location**: `frontend/app/pages/applications/login.vue`

Applicants can log in using:
- **Application Number**: Format `APP-{programId}-{year}-{serialNo}` (e.g., `APP-1-2024-0001`)
- **NIN**: National Identification Number (11 digits)

**API Endpoint**: `POST /api/applications/login`

**Request**:
```json
{
  "applicationNo": "APP-1-2024-0001",
  "nin": "12345678901"
}
```

**Response**:
```json
{
  "id": 1,
  "applicationNo": "APP-1-2024-0001",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "status": "In Progress",
  "program": { ... },
  ...
}
```

### 2. Applicant Dashboard (`/applications`)

**Location**: `frontend/app/pages/applications/index.vue`

After successful login, applicants are redirected to their dashboard which displays:

- **Welcome message** with applicant's name
- **List of all applications** submitted by the applicant
- **Application cards** showing:
  - Application Number
  - Program Name
  - Status (with color-coded badge)
  - Email and Phone
  - Submission Date
  - Last Updated Date
  - Reviewer Comments (if any)
- **View button** to access full application details
- **Logout button**

**Status Colors**:
- 🟢 Green: Accepted
- 🔴 Red: Rejected
- 🔵 Blue: Submitted
- 🟡 Yellow: Reviewed
- ⚪ Gray: In Progress

**API Endpoint**: `POST /api/applications/student-history`

**Request**:
```json
{
  "nin": "12345678901"
}
```

**Response**: Array of applications for the student

### 3. Application Detail View (`/applications/:id`)

**Location**: `frontend/app/pages/applications/[id]/index.vue`

Displays complete application details with tabs:

1. **Personal Information**: Name, contact, NIN, DOB, address, passport photo
2. **Education**: School details, registration number, level, program duration
3. **Documents**: Upload required documents (school ID, certificates, etc.)
4. **Bank Details**: Account information for disbursements

**Features**:
- Multi-step form with validation
- Step-by-step navigation (can only proceed after completing previous steps)
- Read-only view after submission
- Document upload with preview
- Auto-save functionality

**API Endpoints**:
- `GET /api/applications/single/:id` - Fetch application details
- `POST /api/applications` - Update application data
- `POST /api/applications/school-record` - Update education details
- `POST /api/applications/bank-detail` - Update bank information
- `POST /api/applications/documents` - Upload documents
- `PATCH /api/applications/submit-application` - Submit for review

## Session Management

### Cookie Storage

The applicant store uses cookies for session persistence:

- **`applicant-application-id`**: Current application ID
- **`applicant-applications`**: Cached list of user's applications
- **`applicant-nin`**: User's NIN for session validation

### Session Initialization

On page load, the store automatically:
1. Checks for existing cookies
2. Restores cached applications if available
3. Reloads applications from server if NIN is present but cache is empty

### Logout

Clears all session cookies and redirects to `/applications/login`.

## Components

### ApplicationLoginForm

**Location**: `frontend/app/components/applications/ApplicationLoginForm.vue`

- Form with Application Number and NIN fields
- Zod validation schema
- Loading state during authentication
- Error handling with toast notifications
- Automatic redirect on success

### Application Form Components

Located in `frontend/app/components/applications/`:

- `PersonalInformationForm.vue` - Personal details tab
- `EducationForm.vue` - School records tab
- `DocumentUploads.vue` - Document upload tab
- `BankForm.vue` - Bank details tab
- `ReviewApplication.vue` - Final review screen

## Security Considerations

### Current Implementation

- ✅ Application Number + NIN authentication
- ✅ Session stored in HTTP-only cookies
- ✅ NIN validation (11 digits)
- ✅ Application number validation

### Recommended Enhancements

- [ ] Rate limiting on login attempts
- [ ] Session timeout (auto-logout after inactivity)
- [ ] CSRF token protection
- [ ] Two-factor authentication option
- [ ] Login attempt logging
- [ ] Password-based authentication (in addition to NIN)

## User Flow

```
1. Applicant receives email with Application Number
2. Navigates to /applications/login
3. Enters Application Number + NIN
4. System validates credentials via API
5. On success:
   - Store session in cookies
   - Load all applications for the NIN
   - Redirect to /applications (dashboard)
6. Dashboard displays all applications
7. User clicks "View" on an application
8. System loads detailed view at /applications/:id
9. User can view/edit application (if not submitted)
10. User can logout anytime
```

## Error Handling

### Login Errors

- Invalid Application Number: "Invalid Application Number"
- Invalid NIN: "Invalid NIN"
- Network errors: "Failed to login. Please check your credentials."
- Validation errors: Display specific field errors

### Dashboard Errors

- Loading errors: Display error card with message
- Empty state: "No applications found"
- Network errors: Toast notification with retry option

### Application Detail Errors

- 404: "Application not found" error page
- Loading errors: Display error message
- Update errors: Toast notification with error details

## Testing

### Manual Testing Checklist

- [ ] Login with valid credentials
- [ ] Login with invalid Application Number
- [ ] Login with invalid NIN
- [ ] View dashboard after login
- [ ] Verify all applications are listed
- [ ] Check status colors are correct
- [ ] View application details
- [ ] Navigate between application tabs
- [ ] Edit application (if in progress)
- [ ] Submit application
- [ ] View submitted application (read-only)
- [ ] Logout and verify session cleared
- [ ] Verify session persistence (refresh page)

### Integration Testing

- [ ] Verify `/applications/login` API endpoint
- [ ] Verify `/applications/student-history` API endpoint
- [ ] Verify `/applications/single/:id` API endpoint
- [ ] Test error responses
- [ ] Test concurrent sessions
- [ ] Test session expiration

## Future Enhancements

1. **Email Notifications**
   - Send email when application status changes
   - Email with magic link for passwordless login

2. **Application Analytics**
   - Track application progress
   - Show completion percentage
   - Estimated review time

3. **Real-time Updates**
   - WebSocket notifications for status changes
   - Live chat with support

4. **Mobile Responsiveness**
   - Optimize for mobile devices
   - Progressive Web App (PWA) support

5. **Accessibility**
   - WCAG 2.1 AA compliance
   - Screen reader support
   - Keyboard navigation

## Related Documentation

- [Application Workflow Implementation](./APPLICATION_WORKFLOW_IMPLEMENTATION.md)
- [Programs PRD](./PROGRAM_MANAGEMENT_PRD.md)
- [API Endpoints](../api/ENDPOINTS.md)

## Support

For issues or questions, contact the development team.
