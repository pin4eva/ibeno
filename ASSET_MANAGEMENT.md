# Asset Management Module

This module provides comprehensive asset management functionality for the admin dashboard.

## Features

### Asset Management
- ✅ Create new assets with automatic asset number generation
- ✅ Upload and manage asset images (via Cloudinary)
- ✅ Edit asset details and update images
- ✅ Delete assets (with automatic image cleanup)
- ✅ Search assets by name or asset number
- ✅ Filter assets by location and type

### Asset Properties
- **Name**: Name of the asset (required)
- **Description**: Detailed description (required)
- **Location**: Physical location (required)
- **Asset Number**: Unique identifier (auto-generated if not provided, e.g., AST-2025-0001)
- **Asset Type**: Category/type of asset (optional)
- **Image**: Visual representation of the asset (optional, max 5MB)

## API Endpoints

### Assets

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/assets` | Get all assets with optional filters | Yes |
| GET | `/api/assets/:id` | Get single asset by ID | Yes |
| POST | `/api/assets` | Create new asset | Yes (Admin/Editor) |
| PUT | `/api/assets/:id` | Update asset | Yes (Admin/Editor) |
| DELETE | `/api/assets/:id` | Delete asset | Yes (Admin) |
| GET | `/api/assets/locations` | Get unique locations | Yes |
| GET | `/api/assets/types` | Get unique asset types | Yes |

### Query Parameters (for GET /api/assets)
- `search`: Search by name or asset number
- `location`: Filter by location
- `assetType`: Filter by asset type

## Frontend Pages

### Admin Pages
- `/admin/assets` - List all assets with search and filter
- `/admin/assets/create` - Create new asset form
- `/admin/assets/[id]` - Edit existing asset

### Components
- **Assets Store**: Pinia store for state management
- **Asset Interface**: TypeScript types for type safety

## Usage

### Creating an Asset

1. Navigate to `/admin/assets`
2. Click "Create Asset" button
3. Fill in the required fields:
   - Asset Name
   - Description
   - Location
4. Optionally:
   - Upload an image
   - Specify Asset Type
   - Provide custom Asset Number (or leave empty for auto-generation)
5. Click "Create Asset"

### Editing an Asset

1. Navigate to `/admin/assets`
2. Click the eye icon on the asset you want to edit
3. Update the fields as needed
4. To change the image:
   - Click "Change Image" to upload a new image
   - Click "Remove" to delete the current image
5. Click "Update Asset"

### Deleting an Asset

1. Navigate to `/admin/assets`
2. Click the trash icon on the asset you want to delete
3. Confirm the deletion in the modal
4. The asset and its image will be permanently deleted

### Searching and Filtering

- **Search**: Type in the search box to find assets by name or asset number
- **Filter by Location**: Select a location from the dropdown
- **Filter by Type**: Select an asset type from the dropdown

## Implementation Details

### Backend (NestJS)

**Asset Service** (`api/src/assets/services/assets.service.ts`)
- Handles all business logic for asset CRUD operations
- Implements auto-generation of asset numbers with format: `AST-YYYY-NNNN`
- Manages image uploads and deletions via Cloudinary
- Provides filtering and search functionality

**Asset Controller** (`api/src/assets/controllers/assets.controller.ts`)
- Exposes REST API endpoints
- Implements role-based access control
- Validates input using DTOs

**Asset DTOs** (`api/src/assets/dto/asset.dto.ts`)
- `CreateAssetDTO`: Validation for creating assets
- `UpdateAssetDTO`: Validation for updating assets
- `FilterAssetsDTO`: Query parameters for filtering

### Frontend (Nuxt 3)

**Assets Store** (`frontend/app/stores/assets.store.ts`)
- Manages asset state
- Provides actions for CRUD operations
- Handles API calls with error management

**Asset Pages** (`frontend/app/admin/pages/admin/assets/`)
- `index.vue`: List view with search, filter, and delete functionality
- `create.vue`: Form for creating new assets with image upload
- `[id].vue`: Form for editing existing assets

## Database Schema

```prisma
model Asset {
  id          Int      @id @default(autoincrement())
  name        String
  description String
  location    String
  assetNumber String   @unique
  imageUrl    String?
  assetType   String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("assets")
}
```

## Security

- All endpoints require authentication
- Create and Update operations require Admin or Editor role
- Delete operations require Admin role
- Image uploads are validated (max 5MB)
- Old images are automatically deleted when replaced

## Notes

- Asset numbers are automatically generated in the format: `AST-YYYY-NNNN`
  - AST: Asset prefix
  - YYYY: Current year
  - NNNN: Sequential number with leading zeros
- Images are stored in Cloudinary
- When updating an asset's image, the old image is automatically deleted
- When deleting an asset, its image is also deleted from Cloudinary
