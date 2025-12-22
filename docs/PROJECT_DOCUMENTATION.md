# Project Documentation: Ibeno

## 1. Project Overview

**Ibeno** is a comprehensive platform designed to manage various organizational activities including educational and medical programs, asset tracking, and procurement processes. The system is built as a modern web application with a decoupled architecture, featuring a robust NestJS backend and a dynamic Nuxt 4 frontend.

The project aims to modernize legacy systems, providing a unified interface for administrators, contractors, and the public to interact with the organization's services.

## 2. Tech Stack

### Backend (`/api`)

- **Framework:** [NestJS](https://nestjs.com/) (Node.js)
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** [Prisma](https://www.prisma.io/)
- **Package Manager:** Bun (implied by README) / npm
- **Key Libraries:**
  - `bcryptjs`, `jsonwebtoken`: Authentication & Security
  - `cloudinary`: Image/File Management
  - `class-validator`, `class-transformer`: DTO Validation
  - `@nestjs/swagger`: API Documentation
  - `@getbrevo/brevo`: Email Services (inferred)

### Frontend (`/frontend`)

- **Framework:** [Nuxt 4](https://nuxt.com/) (Vue.js)
- **UI Library:** [Nuxt UI](https://ui.nuxt.com/)
- **State Management:** [Pinia](https://pinia.vuejs.org/)
- **Language:** TypeScript
- **Editor:** [TipTap](https://tiptap.dev/) (WYSIWYG)
- **Icons:** Iconify (Lucide, Simple Icons)

## 3. Architecture & Directory Structure

The project is structured as a monorepo containing both the API and Frontend applications.

```
d:/projects/ibeno/
├── api/                  # NestJS Backend
│   ├── prisma/           # Database Schema & Migrations
│   ├── src/              # Source Code
│   │   ├── assets/       # Asset Management Module
│   │   ├── cloudinary/   # Cloudinary Integration
│   │   ├── email/        # Email Service
│   │   ├── procurement/  # Procurement & Bidding Module
│   │   ├── programs/     # Programs & Applications Module
│   │   ├── user/         # User Management
│   │   └── ...           # Core (Auth, Guards, etc.)
│   └── ...
├── frontend/             # Nuxt 4 Frontend
│   ├── app/              # Application Source
│   │   ├── admin/        # Admin Dashboard Pages
│   │   ├── components/   # Reusable UI Components
│   │   ├── pages/        # Public Pages
│   │   ├── stores/       # Pinia Stores
│   │   └── ...
│   └── ...
├── docs/                 # Project Documentation
└── old-ibeno/            # Legacy Reference Code
```

## 4. Database Schema (Prisma)

The data model is defined in `api/prisma/schema.prisma` and includes the following key domains:

### Authentication & Users

- **User**: Stores user profile (Name, Email, Role, Department).
- **Auth**: Handles authentication credentials (Password, OTP, Status).
- **Invitation**: Manages user invitations with roles.
- **Roles**: `User`, `Admin`, `Editor`, `Developer`, `Student`, `Contractor`.

### Programs & Applications

- **Program**: Educational or Medical programs (Name, Description, Dates).
- **Application**: User applications for programs (Personal Info, Status).
- **BankDetail**: Applicant banking information.
- **DocumentUpload**: Supporting documents (Certificates, ID).
- **SchoolRecord**: Academic history for educational applications.

### Asset Management

- **Asset**: Physical assets (Name, Description, Location, Asset Number, Image).
- **Properties**: Auto-generated Asset Numbers (`AST-YYYY-NNNN`).

### Procurement

- **Procurement**: Tenders/Opportunities (Title, Reference, Deadline, Documents).
- **Contractor**: Registry of pre-qualified contractors.
- **Bid**: Contractor proposals for procurements (Price, Documents, Status).
- **BidEvent**: Audit log for bid activities.

## 5. Key Features & Modules

### 5.1. Authentication

- Role-based access control (RBAC).
- OTP-based verification.
- User invitation system for onboarding staff.

### 5.2. Program Management

- Admins can create and manage programs.
- Public users can apply for active programs.
- Comprehensive application form with multi-step data collection (Personal, Bank, Documents, School).

### 5.3. Asset Management

- **CRUD Operations**: Create, Read, Update, Delete assets.
- **Image Handling**: Integration with Cloudinary for asset images.
- **Search & Filter**: Filter by location, type, or search by name/number.
- **Auto-numbering**: Automatic generation of unique asset identifiers.

### 5.4. Procurement Module

- **Contractor Registry**: Database of approved contractors.
- **Tender Publishing**: Admins publish procurements with documents and deadlines.
- **Bidding System**: Registered contractors can submit bids.
- **Review Process**: Admins review, accept, or reject bids.
- **Public Portal**: Public view of open procurements.

## 6. Setup & Development

### Prerequisites

- Node.js
- Bun (recommended) or npm/pnpm
- PostgreSQL Database
- Cloudinary Account (for assets)

### Backend Setup (`/api`)

1.  Install dependencies:
    ```bash
    cd api
    bun install
    ```
2.  Configure Environment Variables (`.env`):
    - `DATABASE_URL`
    - `CLOUDINARY_URL` / Credentials
    - `JWT_SECRET`
    - Email Service Credentials
3.  Run Migrations:
    ```bash
    bun run build  # Runs prisma generate
    # Ensure database is running and accessible
    ```
4.  Start Server:
    ```bash
    bun run start:dev
    ```

### Frontend Setup (`/frontend`)

1.  Install dependencies:
    ```bash
    cd frontend
    pnpm install
    ```
2.  Start Development Server:
    ```bash
    pnpm dev
    ```
    Access at `http://localhost:3000`.

## 7. API Overview

The API is organized into RESTful modules. Key endpoints include:

- **Auth**: `/auth/login`, `/auth/register`, `/auth/invite`
- **Users**: `/users`, `/users/profile`
- **Programs**: `/programs`, `/programs/:id/apply`
- **Assets**: `/assets` (GET, POST, PUT, DELETE)
- **Procurement**:
  - `/procurements` (Manage tenders)
  - `/contractors` (Registry)
  - `/bids` (Submission and review)

## 8. Documentation Resources

- **Procurement PRD**: `docs/procurement-prd.md` - Detailed requirements for the procurement module.
- **Asset Management**: `ASSET_MANAGEMENT.md` - Guide for the asset management features.
- **API Endpoints**: `api/ENDPOINTS.md` (Referenced in instructions).
