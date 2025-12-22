# Procurement Module PRD

## Purpose

Deliver a procurement module that lets the Trust publish open procurements and accept bids only from registered contractors (identified by a contractor number). The module spans backend APIs and the admin/frontend experiences.

## Background (Contractor Registry)

The Trust tracks contractors in `AUGUST CONTRACTOR-LIST.xlsx` with columns such as:

- `NEW Reg. #` (treat as `contractorNo`, unique)
- `OLD REG. NO.` / `CAC Reg. No.` (legacy identifiers)
- `COMPANY NAME`
- `STATUS` (e.g., ACTIVE / INACTIVE / NOT FOUND)
- `REGISTRATION CATEGORY` (ENTERPRISES, LIMITED LIABILITY, etc.)
- `MAJOR AREA`, `SUB-AREA`, `STATE OF ORIGIN`, `COMMUNITY`
- `CONTACT PERSON`, `PHONE NUMBER`
  These values must be imported to seed the contractor registry. Only contractors with a valid `contractorNo` and ACTIVE status may bid.

## Goals

- Publish procurements with clear scope, timelines, documents, and constraints.
- Enforce that only registered contractors (by `contractorNo`) can submit bids.
- Provide admins tools to create, edit, manage, and award procurements; list and review bids.
- Provide a public/open view of active procurements with bidding entry for registered contractors.

## Non-Goals

- Payments, contracting workflows beyond award notification.
- Full vendor onboarding (use existing contractor registry).
- Evaluation scoring automation (manual review only, but status tracking is required).

## Personas & Roles

- **Admin** (Trust staff): Creates and manages procurements, reviews bids, awards/archives.
- **Contractor (registered)**: Views open procurements, submits/updates/withdraws bids using `contractorNo`.
- **Public/Guest**: Views open procurements and details, but cannot bid without a valid `contractorNo`.

## User Stories

- As an admin, I can publish a procurement with title, reference number, scope, documents, location, submission deadline, and category/type.
- As an admin, I can edit or close a procurement, upload/update attached documents, and delete drafts.
- As an admin, I can view and filter all procurements and see bid counts per procurement.
- As an admin, I can review bids, see supporting files, and mark bids as under_review / accepted / rejected / awarded / withdrawn.
- As a registered contractor, I can search open procurements, view details, and submit a bid using my `contractorNo`.
- As a registered contractor, I can update or withdraw my own bid before the submission deadline.

## Functional Requirements

### Procurement lifecycle

- States: `draft`, `published`, `closed`, `awarded`, `archived`.
- Only `published` procurements are visible publicly. Closing prevents new bids. Awarding requires selecting a winning bid. Archiving hides from public lists.

### Procurement fields (create/edit)

- Required: `title`, `referenceNo` (auto-generate if blank), `category`, `type`, `location`, `description/scope`, `submissionDeadline` (UTC), `publishDate` (default now), `createdBy`.
- Optional: `budgetEstimate`, `preBidMeeting` (datetime + location + notes), `eligibilityCriteria`, `documents[]` (file uploads), `tags`, `contactEmail/phone`.
- Reference number rule: if none provided, generate `PROC-{YYYYMMDD}-{####}` unique per day.

### Procurement listing/search

- Public and admin listings with search by `title` or `referenceNo`.
- Filters: `status`, `location`, `category`, `type`, `submissionDeadline` range; admin-only filter by `createdBy`.
- Show counts of bids per procurement and remaining time to deadline.

### Bidding

- Only contractors with a valid `contractorNo` in the registry and `status = ACTIVE` may bid.
- Bid fields: `contractorNo`, `companyName` (prefill from registry), `contactName`, `contactEmail`, `contactPhone`, `price` (optional/number), `technicalProposalUrl`, `commercialProposalUrl`, `otherFiles[]`, `notes`.
- A contractor may have one active bid per procurement; updates overwrite previous submission version and keep an audit trail.
- Bid statuses: `submitted`, `under_review`, `accepted`, `rejected`, `withdrawn`, `awarded` (only one bid can be awarded per procurement).
- Deadline enforcement: no submissions/edits after `submissionDeadline` or when procurement is `closed`/`archived`.

### Documents & uploads

- Support multiple document uploads per procurement (admin) and multiple attachments per bid.
- Store uploaded file URLs; ensure virus scan or file-type whitelisting (pdf, docx, xlsx, png, jpg) and max size (e.g., 20 MB).

### Contractor registry

- Import from `AUGUST CONTRACTOR-LIST.xlsx` into a `Contractor` table.
- Fields: `contractorNo` (from NEW Reg. #, unique), `oldRegNo`, `cacRegNo`, `companyName`, `status`, `registrationCategory`, `majorArea`, `subArea`, `stateOfOrigin`, `community`, `contactPerson`, `phone`, `email` (optional), `notes`, `sourceSheet`.
- CRUD not required initially; provide read-only reference for validation and admin lookup.

### Validation

- Procurement create/edit: required fields present; submissionDeadline > now; publishDate <= submissionDeadline.
- Bid submit/update: valid contractorNo exists and is ACTIVE; required contact fields; file uploads present when mandated by admin; enforce one active bid per contractor/procurement.
- Server-side validation on all write endpoints; meaningful error messages.

### Permissions & Security

- Admin endpoints require authenticated admin role.
- Public GETs allowed for published procurements and assets/documents intended for public download.
- Bids submit/update/withdraw require contractor identity via contractorNo and a one-time passcode or minimal login (MVP: contractorNo + email/phone match + OTP challenge).
- Rate-limit bid submissions/updates to mitigate abuse.
- Audit log changes to procurement status and bid status changes (actor, timestamp, action).

### Notifications (MVP)

- Email admins when a new bid is submitted (include procurement ref and contractorNo).
- Email contractor on submission, update, or decision (accepted/rejected/awarded).

### Analytics/Reporting (MVP)

- Admin dashboard widgets: count of open procurements, bids per procurement, upcoming deadlines.
- Export bids to CSV for a procurement (admin-only).

### Error handling

- User-friendly messages for deadline passed, contractor not found/inactive, duplicate bid, and file validation failures.

## Data Model (proposed)

- `Contractor(id, contractorNo, oldRegNo, cacRegNo, companyName, status, registrationCategory, majorArea, subArea, stateOfOrigin, community, contactPerson, phone, email, notes, sourceSheet, createdAt, updatedAt)`
- `Procurement(id, referenceNo, title, category, type, location, description, eligibilityCriteria, submissionDeadline, publishDate, status, budgetEstimate, preBidMeetingDate, preBidMeetingLocation, preBidNotes, tags[string[]], contactEmail, contactPhone, createdBy, createdAt, updatedAt)`
- `ProcurementDocument(id, procurementId, name, url, mimeType, size, createdAt)`
- `Bid(id, procurementId, contractorId, contractorNo, contactName, contactEmail, contactPhone, price, technicalProposalUrl, commercialProposalUrl, otherFiles[string[]], notes, status, submittedAt, updatedAt)`
- `BidEvent(id, bidId, action, actorId/null for contractor, actorRole, metadata JSON, createdAt)` (audit trail)

## API Surface (NestJS, secured)

- `POST /api/procurements` (admin) create; auto-generate `referenceNo` if blank.
- `GET /api/procurements` public list with search & filters (status defaults to published/open).
- `GET /api/procurements/:id` public detail when published; admin can view any.
- `PATCH /api/procurements/:id` (admin) update fields/status; cannot move back from archived.
- `DELETE /api/procurements/:id` (admin) delete draft or archive published ones.
- `POST /api/procurements/:id/documents` (admin) upload procurement docs.
- `POST /api/procurements/:id/bids` submit bid (contractor auth/OTP); validates contractorNo & deadline.
- `PATCH /api/procurements/:id/bids/:bidId` update/withdraw own bid before deadline.
- `GET /api/procurements/:id/bids` (admin) list bids with search/filter by contractorNo/company/status; export option.
- `PATCH /api/procurements/:id/bids/:bidId/status` (admin) change bid status; enforce single awarded bid.
- `GET /api/contractors` (admin) search registry; `GET /api/contractors/:contractorNo` lookup for validation.

## Frontend (Nuxt admin & public)

- Admin navigation: new "Procurements" section with tabs for List, Create, and Bid review per procurement.
- **Admin List**: table with columns (Reference, Title, Category/Type, Location, Status, Deadline, Bids count, Updated); search box; filters (status, location, category, type, deadline range).
- **Create/Edit form**: sections for Basics, Schedule, Eligibility, Documents. Use `USelectMenu` with `:items` and `value-key="value"` for category/type/location selections. File upload widgets for documents.
- **Procurement detail (admin)**: summary header + documents + bids table with status pills and actions (view bid, change status, export bids CSV).
- **Public page**: list of published/open procurements with search & filters; detail page showing description, documents, deadline, and a "Submit bid" panel prompting for contractorNo + contact info + upload fields.
- **Bid form (public/contractor)**: contractorNo lookup/validation, prefills company name; upload proposal files; clear validation errors; submission confirmation screen.
- Responsive layouts; emphasize deadline warnings.

## Import/Seed Plan

- One-time import script to read `docs/AUGUST CONTRACTOR-LIST.xlsx` and populate `Contractor`. Map columns: NEW Reg. # → contractorNo, OLD REG. NO. → oldRegNo, CAC Reg. No. → cacRegNo, COMPANY NAME → companyName, STATUS → status, REGISTRATION CATEGORY → registrationCategory, MAJOR AREA → majorArea, SUB-AREA → subArea, STATE OF ORIGIN → stateOfOrigin, COMMUNITY → community, CONTACT PERSON → contactPerson, PHONE NUMBER → phone, DATE → createdAt (fallback to now). Record `sourceSheet` for lineage.

## Acceptance Criteria

- Admin can create/publish/close/award procurements with required validations and auto reference number when omitted.
- Public can view published procurements; only registered ACTIVE contractors (by contractorNo) can submit bids; duplicates prevented per procurement.
- Admin can view and change bid statuses and export bids; single awarded bid per procurement enforced.
- Contractor registry seeded from the provided Excel file; contractorNo validation enforced on bid submission.
- All write APIs validated server-side; unauthorized actions blocked; audit trail recorded for status changes.

## Risks & Mitigations

- **Bad data in registry**: normalize contractor numbers on import (trim/uppercase); log rejects.
- **Deadline race**: enforce deadline at DB/API level, not just UI.
- **File abuse**: enforce size/type checks; consider AV scanning if available.

## Out of Scope (MVP)

- Payment handling, contract performance tracking, complex evaluation scoring, multi-round RFX, and supplier self-registration.
