# Outstanding Work and Partial Implementations

## Scope & Sources

- Reviewed implementation docs in [docs/IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) and [docs/PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md).
- Sampled key frontend flows: admin procurements, programs, public procurement detail, contractor dashboard, authentication pages.
- Noted absence of CI, Docker, and environment samples in repo root.

## Authentication & User Management

- Frontend lacks invite-user UI and self-service profile/change-password flows; only auth pages and basic admin user list are present.
- Role-guard coverage in backend controllers needs an audit to match PRD (no explicit enforcement map documented).
- No UI/logic for department assignment or status toggles surfaced in admin screens.

## Programs & Applications

- Program create/edit screens exist, but application workflow is unclear: no visible multi-step application form with document upload, review, or submission receipt per PRD.
- Admin application review/approval UI not found; no status change controls or document preview in admin area.
- Applicant “My Applications” dashboard is absent; users cannot track submissions.

## Procurement & Bidding

- Admin procurement detail recently improved, but bid evaluation/award UI is missing (no side-by-side comparison or award action).
- Public procurement detail surfaces a bid modal placeholder; success handler is empty and no post-submit refresh or confirmation flow is wired.
- Contractor dashboard depends on manual contractor number entry; lacks authenticated contractor profile/edit experience and bid history filters.
- No import tooling for legacy contractor registry (Excel) on frontend or API surfaces.

## Assets

- Asset CRUD exists server-side, but UI polish gaps remain: image upload flow, QR/label generation, and audit/history views are not present.
- Bulk import/export for assets is not implemented.

## File Uploads & Documents

- Frontend relies on `/upload` helper; there is no documented storage configuration or file validation limits in repo docs.
- Procurement document and bid uploads lack virus/type/size guardrails in UI and have no visible retry/error states.

## Backend Platform

- API README is still Nest starter text; no environment variable reference, no endpoint map, no runbook.
- No Dockerfile or compose for local DB/Prisma; setup steps are manual.
- Prisma migrations exist but no seed data or fixture scripts are provided.

## Frontend Quality & UX

- No global form validation patterns documented; several flows (bid submission, applications) have minimal validation and lack optimistic or error states.
- Accessibility passes unknown; no lint/typecheck run instructions beyond defaults; no loading/error fallbacks on some routes.

## Testing & CI/CD

- Frontend has no tests (unit/e2e) and no CI workflows.
- Backend keeps Nest starter tests only; domain modules (procurement, programs, assets, auth) have no unit/e2e coverage.
- No automated lint/typecheck/format gating in CI.

## Documentation

- Missing project-specific README sections for both frontend and API (env vars, scripts, data model, routing to `/api/*`).
- No user-facing guides for contractors/applicants/admins; no release checklist or migration notes.

## Recommended Next Steps (High Impact)

1. Ship user-facing gaps: invite/profile/change-password; application submission/review; bid submission evaluation/award; contractor auth + profile.
2. Add storage/env documentation and tighten upload validation on both client and server.
3. Provide Docker/compose plus seed data for faster onboarding.
4. Establish CI with lint/typecheck/tests; add smoke tests for auth, programs, procurements.
5. Author role/permission matrix and update admin UI to enforce it consistently.
