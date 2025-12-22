# Project Modules & Implementation Plan

Based on the `PRD.md` and the legacy `nuxt-frontend` structure, this document outlines the modules and sub-modules required to complete the IBENO v2 project.

## 1. Core Infrastructure & Configuration

**Description**: Foundation setup for both Backend (NestJS) and Frontend (Nuxt 3), including database connection, environment configuration, and shared utilities.

### Backend (NestJS)

- [ ] **Setup**: Initialize NestJS project with Bun.
- [ ] **Database**: Configure Prisma with Postgres.
  - [ ] Define `schema.prisma` (migrate from legacy).
  - [ ] Create migration scripts.
  - [ ] Create seed scripts (`prisma/seed.ts`).
- [ ] **Config**: Set up `@nestjs/config` for environment variables.
- [ ] **Global Utilities**:
  - [ ] Global Exception Filter.
  - [ ] Validation Pipe (DTO validation).
  - [ ] Response Interceptor (standardize API responses).
  - [ ] Health Check Module (`/health`).

### Frontend (Nuxt 3)

- [ ] **Setup**: Initialize Nuxt 3 project with Bun.
- [ ] **UI Framework**: Configure `@nuxt/ui` and Tailwind CSS.
  - [ ] Port global styles from `app/assets/css/main.css`.
  - [ ] Configure `app.config.ts` (colors, theme).
- [ ] **State Management**: Setup Pinia.
- [ ] **API Client**: Create a custom `$fetch` wrapper or composable (`useApi`) for handling API requests, auth headers, and error handling.
- [ ] **Layouts**:
  - [ ] `default.vue`: Main layout with Header/Footer.
  - [ ] `auth.vue`: Layout for login/signup pages.
  - [ ] `admin.vue`: Dashboard layout with Sidebar/Navigation.

---

## 2. Authentication & Authorization (Auth)

**Description**: Handles user registration, login, password management, and role-based access control.

### Backend (NestJS) - `src/auth/`

- [ ] **Auth Module**:
  - [ ] `AuthService`: Validate users, generate JWTs.
  - [ ] `AuthController`: Endpoints for login, register, forgot-password, reset-password.
  - [ ] `JwtStrategy`: Passport strategy for JWT validation.
  - [ ] `RolesGuard`: Guard to check user roles (Admin, HR, Finance, etc.).
- [ ] **DTOs**: `LoginDto`, `RegisterDto`, `ForgotPasswordDto`, `ResetPasswordDto`.

### Frontend (Nuxt 3) - `app/auth/`

- [ ] **Pages**:
  - [ ] `/auth/login`: Login form.
  - [ ] `/auth/register`: Registration form.
  - [ ] `/auth/forgot-password`: Request password reset.
  - [ ] `/auth/reset-password`: Reset password form.
- [ ] **Store**: `authStore.ts` (manage user session, token, login/logout actions).
- [ ] **Middleware**: `auth.ts` (protect routes, redirect unauthenticated users).

---

## 3. User Management (Users)

**Description**: Management of system users, profiles, roles, and administrative actions.

### Backend (NestJS) - `src/users/`

- [ ] **Users Module**:
  - [ ] `UsersService`: CRUD operations for users.
  - [ ] `UsersController`: Endpoints for getting profile (`/me`), updating profile, admin user management.
- [ ] **Features**:
  - [ ] Avatar upload (integrate with Storage module).
  - [ ] Role management (Admin only).
  - [ ] Invitation system (invite users via email).

### Frontend (Nuxt 3) - `app/admin/users/` & `app/pages/profile/`

- [ ] **Pages**:
  - [ ] `/admin/users`: List all users (Admin).
  - [ ] `/admin/users/[id]`: Edit user details.
  - [ ] `/profile`: User profile settings (update info, avatar, password).
- [ ] **Store**: `userStore.ts`.

---

## 4. Departments & Jobs

**Description**: Management of organizational departments and job postings.

### Backend (NestJS) - `src/departments/` & `src/jobs/`

- [ ] **Departments Module**:
  - [ ] CRUD endpoints for Departments.
- [ ] **Jobs Module**:
  - [ ] CRUD endpoints for Jobs.
  - [ ] Link Jobs to Departments.
  - [ ] Job status management (Open/Closed).

### Frontend (Nuxt 3) - `app/admin/departments/` & `app/admin/jobs/`

- [ ] **Pages**:
  - [ ] `/admin/departments`: List/Create/Edit departments.
  - [ ] `/admin/jobs`: List/Create/Edit jobs.
  - [ ] `/jobs`: Public listing of open jobs (for applicants).
- [ ] **Stores**: `departmentStore.ts`, `jobStore.ts`.

---

## 5. Applications & Students (Applicants)

**Description**: Core functionality for applicants to apply for jobs/programs and for admins to review applications.

### Backend (NestJS) - `src/applications/` & `src/students/`

- [ ] **Students Module**:
  - [ ] Manage applicant profiles.
- [ ] **Applications Module**:
  - [ ] Submit application.
  - [ ] Update application status (Pending, Reviewed, Approved, Rejected).
  - [ ] Upload documents (CV, Certificates).
  - [ ] Email notifications on status change.

### Frontend (Nuxt 3) - `app/admin/applications/` & `app/portal/`

- [ ] **Pages (Applicant)**:
  - [ ] `/portal/dashboard`: Applicant dashboard (track status).
  - [ ] `/portal/apply/[jobId]`: Application form.
- [ ] **Pages (Admin)**:
  - [ ] `/admin/applications`: List all applications (filter by job/status).
  - [ ] `/admin/applications/[id]`: Review application details.
- [ ] **Stores**: `studentStore.ts`, `applicationStore.ts` (or part of `jobStore`).

---

## 6. Sessions Management

**Description**: Management of application windows or academic sessions.

### Backend (NestJS) - `src/sessions/`

- [ ] **Sessions Module**:
  - [ ] CRUD endpoints for Sessions.
  - [ ] Toggle active session.

### Frontend (Nuxt 3) - `app/admin/sessions/`

- [ ] **Pages**:
  - [ ] `/admin/sessions`: List/Create/Edit sessions.
- [ ] **Store**: `sessionStore.ts`.

---

## 7. Assets Management

**Description**: Tracking of physical assets and their assignment.

### Backend (NestJS) - `src/assets/`

- [ ] **Assets Module**:
  - [ ] CRUD endpoints for Assets.
  - [ ] Assign assets to Departments or Users.

### Frontend (Nuxt 3) - `app/admin/assets/`

- [ ] **Pages**:
  - [ ] `/admin/assets`: Inventory list.
  - [ ] `/admin/assets/create`: Add new asset.
- [ ] **Store**: `assetsStore.ts`.

---

## 8. Contracts & Contractors

**Description**: Management of contracts, contractors, and bidding processes.

### Backend (NestJS) - `src/contracts/`

- [ ] **Contracts Module**:
  - [ ] CRUD for Contractors.
  - [ ] CRUD for Contracts.
  - [ ] Bid submission and management.
  - [ ] File uploads for bids/contracts.

### Frontend (Nuxt 3) - `app/admin/contracts/`

- [ ] **Pages**:
  - [ ] `/admin/contractors`: Manage contractors.
  - [ ] `/admin/contracts`: Manage contracts.
  - [ ] `/admin/contracts/[id]/bids`: View bids for a contract.
- [ ] **Store**: `contractStore.ts`.

---

## 9. Accounts (Budgets & Expenses)

**Description**: Financial management including budget allocation and expense tracking.

### Backend (NestJS) - `src/accounts/`

- [ ] **Accounts Module**:
  - [ ] **Budgets**: CRUD, generate `budgetNo`.
  - [ ] **Expenses**: CRUD, upload evidence, duplicate checks, generate `sn`.
  - [ ] Approval workflows.

### Frontend (Nuxt 3) - `app/admin/accounts/`

- [ ] **Pages**:
  - [ ] `/admin/accounts/budgets`: Budget overview.
  - [ ] `/admin/accounts/expenses`: Expense tracking and submission.
- [ ] **Stores**: `budgetStore.ts`, `expensesStore.ts` (or combined `accountStore.ts`).

---

## 10. Program Support

**Description**: Management of support programs.

### Backend (NestJS) - `src/program/`

- [ ] **Program Module**:
  - [ ] CRUD for Programs.

### Frontend (Nuxt 3) - `app/admin/programs/`

- [ ] **Pages**:
  - [ ] `/admin/programs`: List/Manage programs.
- [ ] **Store**: `programStore.ts`.

---

## 11. Supports (Helpdesk)

**Description**: Internal support ticket system.

### Backend (NestJS) - `src/supports/`

- [ ] **Supports Module**:
  - [ ] Create/Update tickets.
  - [ ] Email notifications on updates.

### Frontend (Nuxt 3) - `app/admin/supports/`

- [ ] **Pages**:
  - [ ] `/admin/supports`: Ticket list.
  - [ ] `/admin/supports/[id]`: Ticket details and chat/comments.
- [ ] **Store**: `supportStore.ts` (new, or part of `app.interface.ts` logic).

---

## 12. Leave Requests

**Description**: Employee leave management.

### Backend (NestJS) - `src/leave/`

- [ ] **Leave Module**:
  - [ ] Create leave request.
  - [ ] Approve/Reject leave request.
  - [ ] List requests.

### Frontend (Nuxt 3) - `app/admin/leave/`

- [ ] **Pages**:
  - [ ] `/admin/leave`: My leave requests / Manage requests (based on role).
- [ ] **Store**: `leaveStore.ts` (implied from interfaces).

---

## 13. File Storage & Notifications

**Description**: Shared services for handling files, emails, and in-app alerts.

### Backend (NestJS) - `src/common/` or `src/notifications/`

- [ ] **Storage Service**:
  - [ ] Abstract provider (Local/S3/Cloudinary).
  - [ ] Methods: `upload`, `delete`, `replace`.
- [ ] **Notification Service**:
  - [ ] **Email**: Abstract provider (Nodemailer/SES). Templates for system events.
  - [ ] **In-App**: Store notifications in DB, SSE/WebSockets for real-time delivery (optional for v1).

### Frontend (Nuxt 3)

- [ ] **Composables**:
  - [ ] `useFileUpload`: Helper for handling file inputs and uploads.
  - [ ] `useNotifications`: Toast notifications and notification center logic.

---

## 14. Audit Logging

**Description**: Comprehensive tracking of user activities for security and accountability.

### Backend (NestJS) - `src/audit/`

- [ ] **Audit Module**:
  - [ ] `AuditService`: Log actions to database.
  - [ ] `AuditInterceptor`: Automatically log request details for specific controllers.
  - [ ] `AuditController`: Read-only endpoints for admins to view logs.

### Frontend (Nuxt 3) - `app/admin/audit/`

- [ ] **Pages**:
  - [ ] `/admin/audit`: Datatable of system logs with filtering (User, Date, Action).

---

## 15. Dashboard & Analytics

**Description**: Centralized view of system health and key performance indicators.

### Backend (NestJS) - `src/dashboard/`

- [ ] **Dashboard Module**:
  - [ ] `DashboardController`: Aggregated stats endpoints (e.g., `/dashboard/stats`).
  - [ ] Optimized queries for counts and sums (Applications, Budget, Users).

### Frontend (Nuxt 3) - `app/admin/dashboard/`

- [ ] **Pages**:
  - [ ] `/admin`: Main dashboard with widgets (Stats cards, Recent Activity, Charts).
- [ ] **Components**:
  - [ ] `StatCard.vue`, `ActivityFeed.vue`, `ChartWidget.vue`.

---

## 16. Reporting

**Description**: Data export capabilities for compliance and offline analysis.

### Backend (NestJS) - `src/reports/`

- [ ] **Reports Module**:
  - [ ] Generate CSV/Excel/PDF from data sets (Applications, Expenses, Assets).
  - [ ] Endpoints: `/reports/applications`, `/reports/expenses`.

### Frontend (Nuxt 3)

- [ ] **Features**:
  - [ ] "Export" buttons on list pages (Applications, Assets, Expenses).
