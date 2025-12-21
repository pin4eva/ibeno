# Admin Interface Updates - Implementation Guide

## Overview
This document describes the changes made to implement the following requirements:
1. Remove the admin applications nav (applications now nested within programs)
2. Fix modal issues on Update Program
3. Integrate Tiptap WYSIWYG editor (popular in Vue community)

## Changes Made

### 1. Navigation Changes
**File**: `app/layouts/dashboard.vue`
- ✅ Removed the "Applications" navigation item from the sidebar
- Applications are now accessed through Programs → [Program Details] → Applications list

### 2. WYSIWYG Editor Integration
**Files Updated**:
- `package.json` - Added Tiptap dependencies
- `app/components/WysiwygEditor.vue` - Completely rewritten to use Tiptap

**New Dependencies Added**:
```json
"@tiptap/vue-3": "^2.10.5",
"@tiptap/starter-kit": "^2.10.5",
"@tiptap/pm": "^2.10.5"
```

**Features**:
- Rich text formatting: Bold, Italic, Strikethrough
- Headings: H1, H2, H3
- Lists: Bullet and Numbered
- Blockquotes
- Undo/Redo functionality
- Proper dark mode support
- Active state indicators for formatting buttons

### 3. Modal Fixes
**File**: `app/admin/pages/admin/programs/[id].vue`
- ✅ Fixed modal width using `:ui="{ width: 'sm:max-w-4xl' }"` instead of wrapping in a div
- ✅ Modal now properly displays with correct sizing and responsiveness
- ✅ Removed unnecessary wrapper div that was causing layout issues

### 4. Routing Updates
**File**: `app/admin/pages/admin/programs/[id].vue`
- ✅ Updated `viewApplication()` function to navigate to nested route:
  - Old: `/admin/applications/${id}`
  - New: `/admin/programs/${programId}/applications/${id}`

## Next Steps - MANUAL ACTIONS REQUIRED

### Step 1: Install Dependencies
Run the following command in the `frontend` directory:
```bash
cd frontend
bun install
```

### Step 2: Restructure Admin Pages
The current structure has `programs/[id].vue` as a file. For nested routes, we need it as a directory.

**Option A: Use the PowerShell Script (Windows)**
```powershell
cd frontend
.\restructure-admin-pages.ps1
```

**Option B: Manual Restructuring**
1. Create directory: `app/admin/pages/admin/programs/[id]/`
2. Move `app/admin/pages/admin/programs/[id].vue` to `app/admin/pages/admin/programs/[id]/index.vue`
3. Create directory: `app/admin/pages/admin/programs/[id]/applications/`
4. Copy the content from `APPLICATION_DETAIL_TEMPLATE.vue` to:
   `app/admin/pages/admin/programs/[id]/applications/[applicationId].vue`

### Step 3: Clean Up (Optional)
After successful restructuring, you can delete:
- `frontend/restructure-admin-pages.ps1`
- `frontend/APPLICATION_DETAIL_TEMPLATE.vue`
- `frontend/IMPLEMENTATION_GUIDE.md` (this file)

You may also want to delete the old applications pages if no longer needed:
- `app/admin/pages/admin/applications/index.vue`
- `app/admin/pages/admin/applications/[id].vue`

## New Route Structure

### Before:
```
/admin/programs         → List all programs
/admin/programs/:id     → View program details with applications list
/admin/applications     → List all applications (separate page)
/admin/applications/:id → View application detail
```

### After:
```
/admin/programs                          → List all programs
/admin/programs/:id                      → View program details with applications list
/admin/programs/:id/applications/:appId  → View application detail (nested under program)
```

## Testing Checklist

After completing the manual steps, test the following:

### Navigation
- [ ] Dashboard sidebar no longer shows "Applications" link
- [ ] Can navigate to Programs list
- [ ] Can open a program and see its details
- [ ] Can see the list of applications within the program details page

### Program Update Modal
- [ ] Click "Update" button on program details page
- [ ] Modal opens with proper width (not too narrow or too wide)
- [ ] All fields are editable
- [ ] WYSIWYG editor shows toolbar with formatting options
- [ ] Can apply formatting (bold, italic, headings, lists)
- [ ] Formatting buttons show active state when cursor is on formatted text
- [ ] Can save changes successfully
- [ ] Modal closes after successful save

### Application Navigation
- [ ] Click "View" on an application in the program details page
- [ ] Navigate to `/admin/programs/[programId]/applications/[applicationId]`
- [ ] Can see application details
- [ ] "Back to Program" button returns to correct program details page
- [ ] Can approve/reject applications

### WYSIWYG Editor Features
- [ ] Toolbar buttons are visible and properly styled
- [ ] Bold, Italic, Strikethrough work correctly
- [ ] Headings (H1, H2, H3) can be applied
- [ ] Bullet and numbered lists work
- [ ] Blockquote formatting works
- [ ] Undo/Redo buttons function correctly
- [ ] Editor works in both light and dark modes
- [ ] Content persists when form is submitted

## Troubleshooting

### Issue: Dependencies not installing
**Solution**: Make sure you're using `bun` (not npm or yarn) and you're in the frontend directory:
```bash
cd d:\projects\ibeno\frontend
bun install
```

### Issue: Tiptap editor not showing
**Solution**: Check browser console for errors. Make sure:
1. Dependencies are installed (`node_modules/@tiptap` exists)
2. Nuxt dev server is restarted after installing dependencies
3. No import errors in the component

### Issue: Modal still has issues
**Solution**: Check that you're using the updated code from `[id].vue` (or `[id]/index.vue` after restructuring). The modal should use `:ui="{ width: 'sm:max-w-4xl' }"` and NOT be wrapped in a `<div class="w-full max-w-5xl">`.

### Issue: Nested routes not working
**Solution**: Make sure:
1. File structure is correct: `programs/[id]/applications/[applicationId].vue`
2. The `[id].vue` file has been moved to `[id]/index.vue`
3. Nuxt dev server has been restarted after file restructuring

## Support

If you encounter issues:
1. Check the Nuxt dev server console for errors
2. Check the browser console for client-side errors
3. Verify all files are in the correct locations
4. Ensure `bun install` completed successfully
5. Try restarting the Nuxt dev server

## Summary of Files Modified

### Created:
- `frontend/restructure-admin-pages.ps1`
- `frontend/APPLICATION_DETAIL_TEMPLATE.vue`
- `frontend/IMPLEMENTATION_GUIDE.md` (this file)

### Modified:
- `frontend/package.json` (added Tiptap dependencies)
- `frontend/app/components/WysiwygEditor.vue` (complete rewrite with Tiptap)
- `frontend/app/layouts/dashboard.vue` (removed Applications nav)
- `frontend/app/admin/pages/admin/programs/[id].vue` (fixed modal, updated navigation)

### To Be Created (Manual):
- `frontend/app/admin/pages/admin/programs/[id]/index.vue` (moved from [id].vue)
- `frontend/app/admin/pages/admin/programs/[id]/applications/[applicationId].vue` (from template)

### To Be Deleted (Optional):
- `frontend/app/admin/pages/admin/applications/index.vue`
- `frontend/app/admin/pages/admin/applications/[id].vue`
