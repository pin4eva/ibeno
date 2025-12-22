# Implementation Review & Plan

## 1. Authentication & User Management

### Current Status

- **Backend**: Fully functional Auth Controller (Login, Signup, Invite, Password Reset). User Controller handles CRUD.
- **Frontend**: Login, Signup, Forgot Password pages exist. Admin User management list exists.

### Missing / Partial Implementation

- **Frontend Invite UI**: No dedicated page for admins to invite new users (sending email invitations).
- **Profile Page**: Users need a self-service page to update their profile (avatar, phone, password).
- **Role Granularity**: Ensure `RolesGuard` is applied correctly to all sensitive endpoints (e.g., only Admin can delete users).

### Recommendations

- Create a "User Profile" page (`/profile`) for self-service updates.
- Add an "Invite User" modal/page in the Admin Users section.
- Implement "Change Password" flow for logged-in users.

---

## 2. Program Management

### Current Status

- **Backend**: Basic CRUD for Programs. Enrollment toggling.
- **Frontend**: Admin Program list. Public Program list.

### Missing / Partial Implementation

- **Application Workflow**: The full application submission flow (multi-step form) needs to be verified.
- **Review Interface**: Admins need a dedicated view to review applications, see attached documents, and change status (Approve/Reject).
- **Student Dashboard**: Applicants need a place to see the status of their applications.

### Recommendations

- Build a "My Applications" dashboard for students.
- Enhance the Admin Application Review view with document previews.
- Implement email notifications for application status changes.

---

## 3. Asset Management

### Current Status

- **Backend**: CRUD for Assets. Filtering by location/type.
- **Frontend**: Admin Asset list.

### Missing / Partial Implementation

- **Image Handling**: Ensure the frontend correctly handles image uploads to Cloudinary during asset creation/editing.
- **Asset History**: Track who created/modified an asset (Audit log).
- **Bulk Operations**: Ability to import assets from CSV would be beneficial.

### Recommendations

- Add "Duplicate Asset" feature to quickly add similar items.
- Implement a "Print Label" feature to generate QR codes/Barcodes for assets.

---

## 4. Procurement & Bidding

### Current Status

- **Backend**: Procurement CRUD, Document Management.
- **Frontend**: Admin Procurement list (with stats), Public Procurement list.

### Missing / Partial Implementation

- **Contractor Portal**: A dedicated area for contractors to manage their profile and view bid history.
- **Bid Submission**: The actual form for contractors to submit bids (uploading proposals) needs to be robust.
- **Bid Evaluation**: Admin interface to compare bids side-by-side and award contracts.
- **Contractor Registry Import**: Feature to import the legacy contractor Excel sheet.

### Recommendations

- **Priority**: Implement the **Bid Submission Form** on the public procurement detail page.
- **Priority**: Build the **Bid Evaluation View** for admins.
- Create a "Contractor Dashboard" to track submitted bids.

---

## 5. Implementation Tasks

### Phase 1: Core & Auth Refinement

- [ ] **Feat (Frontend)**: Create "Invite User" modal in Admin Users page.
- [ ] **Feat (Frontend)**: Build "User Profile" page for self-service updates.
- [ ] **Fix (Backend)**: Audit all controllers to ensure `RolesGuard` is applied.

### Phase 2: Procurement Module (High Priority)

- [ ] **Feat (Backend)**: Implement `importContractors` endpoint to parse legacy Excel file.
- [ ] **Feat (Frontend)**: Build "Bid Submission" form with file upload support.
- [ ] **Feat (Frontend)**: Create "Bid Evaluation" dashboard for Admins.
- [ ] **Feat (Frontend)**: Create "Contractor Dashboard" (My Bids).

### Phase 3: Program Management

- [ ] **Feat (Frontend)**: Implement multi-step Application Form.
- [ ] **Feat (Frontend)**: Build "Application Review" interface for Admins.
- [ ] **Feat (Frontend)**: Create "My Applications" view for students.

### Phase 4: Asset Management Polish

- [ ] **Feat (Frontend)**: Verify and polish Asset Image Upload.
- [ ] **Feat (Frontend)**: Add "Print QR Code" button for assets.
