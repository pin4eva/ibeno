Develop an asset management module for the admin dashboard with the following requirements:

**Features:**

1. **Asset Creation**

   - Allow admins to create a new asset with fields: asset name, description, location, and asset number.
   - Enable image upload for each asset.
   - If an asset number is not provided, automatically generate a unique asset number.
   - Preserve existing asset numbers for assets already numbered.

2. **Asset Listing**

   - Display all assets with details, including image thumbnails.

3. **Asset Editing**

   - Allow editing of asset details and updating the asset image.

4. **Asset Deletion**

   - Enable deletion of assets from the system.

5. **Search and Filter**

   - Implement search by asset name or asset number.
   - Provide filtering by location and asset type.

6. **Validation**

   - Ensure all required fields are completed during asset creation and editing.

7. **User Interface**
   - Design intuitive forms for asset creation and editing.
   - Present a clean, organized layout for asset listing.

**Technical Requirements:**

- Implement both API endpoints and frontend components for all features.
- Integrate the module into the admin dashboard.
- Follow best practices for security and data validation.

Note: When use a `<USelectMenu>` component, don't forget to use `:items` instead of `:options` and ensure it has a `value-key="value"` attribute.,
