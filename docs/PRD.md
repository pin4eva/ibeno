# Product Requirements Document (PRD) — IBENO v2

## 1. Background & Goals
- Rebuild legacy Nuxt frontend (`old-ibeno/nuxt-frontend`) into new Nuxt 3 app at `ibeno/frontend`, backed by new NestJS API at `ibeno/api`.
- Stabilize and modernize UX for applicants, admins, and support staff; reduce operational overhead and data inconsistency.
- Target completion: ≤ 1 week for core parity; stretch: incremental UX polish and observability.

## 2. Personas
- **Applicant/Student**: Applies to programs/jobs, tracks status, uploads docs, receives notifications.
- **Admin/HR**: Manages jobs, applications, departments, contracts, budgets/expenses, assets, sessions, users, leaves, supports.
- **Finance Officer**: Oversees budgets/expenses/contracts with evidence uploads and approvals.
- **Support Agent**: Handles support tickets (supports/helpdesk).

## 3. Scope
- **In-Scope (Week 1)**: Auth, Users, Departments, Jobs, Applications/Students/Sessions, Contracts (core flows), Assets, Budgets/Expenses, Leave Requests, Program Support, Supports, File uploads (Cloudinary/S3-style abstraction), Email notifications abstraction, Role-based access, Basic audit (createdAt/updatedAt/actor).
- **Out-of-Scope (Week 1)**: Advanced analytics, multi-tenant, heavy CMS, offline mode, complex workflow engine.

## 4. Success Metrics
- Parity: 100% of legacy API routes available in Nest with green e2e tests for happy-path flows.
- Reliability: <1% error rate on authenticated actions in staging load test (light).
- Performance: P95 < 400ms for primary CRUD endpoints under light load.
- UX: Form submission error rate reduced via client-side validation; zero blocking console errors.

## 5. Functional Requirements
### Auth & Users
- JWT-based auth; signup/login/forgot/reset/change password; invitation flow; role & office changes; avatar upload.
- `GET /auth/me` returns current user; user CRUD; invitation OTP validation; image upload.

### Applicants/Students & Applications
- Start, save, submit, approve applications; login for applicants; seed/demo data; sessions (application windows) with status toggle; email notifications on start/submit/approve.

### Jobs & Departments
- CRUD jobs and departments; job status updates; list/filter jobs.

### Assets
- CRUD assets with ownership/department linkage (if in schema).

### Contracts & Contractors
- Contractor CRUD; contract CRUD; open/close; bid submission and bid file upload; fetch bids per contract and by id; contractor lookup by ID number.

### Budgets & Expenses (Accounts)
- Budget CRUD with generated budgetNo; expense CRUD with evidence upload; duplicate-prevention check on budget/date/note/amount; auto-increment sn.

### Program Support & Supports
- Program create/update/approve/delete/list; support ticket CRUD; approval triggers email.

### Leave Requests
- Create/update leave request; status updates; list and single fetch.

### Dashboard & Analytics
- Admin dashboard with key metrics: Total Applications, Open Jobs, Budget Utilization, Pending Approvals.
- Charts/Graphs for visual representation of data.

### Audit Logging
- Track critical system actions: Login/Logout, Data Creation/Updates/Deletions, Sensitive Data Access.
- Store: Actor, Action, Resource, Timestamp, IP Address.

### Reporting
- Export data to CSV/PDF for: Applications, Expenses, Assets, Contracts.

### Notifications & Emails
- Abstract provider (e.g., Nodemailer/SES) for password reset, invitations, application lifecycle, approvals.
- In-app notification center for real-time updates.

### File Uploads
- Abstraction for storage (Cloudinary/S3); delete-or-replace on update where applicable (expenses, avatars, bids).

### RBAC & Security
- Roles (e.g., admin, hr, finance, support, applicant); guards on sensitive routes; input validation with DTOs; rate limits on auth endpoints.

## 6. Non-Functional Requirements
- Stack: NestJS, Prisma 7, Postgres, Nuxt 3, Pinia, @nuxt/ui, TypeScript everywhere.
- Testing: Unit + e2e for critical flows (auth, user CRUD, application submit, expense create, contract bid).
- Observability: Basic request logging; error logging; health checks (`/health`).
- Deployment: .env-driven config; ready for containerization; staging/prod parity.

## 7. Data Model Notes (initial)
- Users: roles, office, avatarUrl, inviteOtp, password reset tokens, status.
- Jobs: title, deptId, status; Applications: applicant info, jobId, status, documents.
- Sessions: name, start/end, isActive flag.
- Budgets: budgetNo (padded), amount, status; Expenditures: sn (padded), file, note, amount, date, budgetId.
- Contracts/Contractors: contract status, bids, uploaded files.
- Departments, Assets, Programs, Supports, LeaveRequests: standard CRUD + status fields.

## 8. Risks & Mitigations
- **Time**: Aggressive 1-week; mitigate by strict parity-first, polish second.
- **Schema drift**: Legacy Prisma vs new; mitigate by diffing `prisma/schema.prisma` and locking early.
- **Uploads/Email providers**: Choose provider early; mock in tests; feature-flag endpoints needing them.
- **RBAC gaps**: Define roles up front; add guards + e2e.

## 9. Milestones (matching 7-day plan)
- Day 1: Architecture + schema alignment + endpoint mapping finalization.
- Day 2: Nest scaffold, Prisma setup, auth/user modules skeleton.
- Day 3: Auth/User complete with tests; seeds.
- Day 4: Jobs/Departments/Sessions/Applications/Students flows.
- Day 5: Accounts, Assets, Contracts, Program, Supports, Leave.
- Day 6: Nuxt migration (pages, stores, api clients) + guard wiring.
- Day 7: QA, a11y, perf pass, CI checks.

## 10. Acceptance Criteria
- All routes in `api/ENDPOINTS.md` implemented in Nest with DTO validation and guards where needed.
- Prisma migrations run cleanly on Postgres; seed script succeeds.
- Nuxt app uses new API clients; critical user journeys work in staging.
- CI: lint + tests passing; no P0/P1 bugs blocking launch.
