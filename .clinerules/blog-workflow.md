# Blog Post Creation Workflow

## Creating New Blog Posts

### Option 1: Markdown Route (Recommended)
Create markdown files directly in `src/routes/` for automatic route generation.

**Location**: `src/routes/YYYY-MM-DD-slug.md`

**Example**: `src/routes/2025-10-04-test-post.md`

### Option 2: Asset-based Blog Post
Create markdown files in the assets directory for content that may be processed differently.

**Location**: `src/lib/assets/blog/YYYY-MM-DD-slug.md`

**Example**: `src/lib/assets/blog/2025-10-04-dotfiles.md`

### 2. Required Frontmatter
```yaml
---
title: "Post Title"
date: "YYYY-MM-DD"
description: "Brief description"
tags: ["tag1", "tag2"]
published: true
---
```

## Content Structure
- Use markdown formatting
- Images can be placed in `src/lib/assets/blog/images/`
- Reference images with relative paths

## 3. Route Generation
- **Markdown routes** in `src/routes/` automatically generate routes at `/slug`
- **Asset-based posts** may require custom routing logic
- SvelteKit handles route generation automatically for `.md` files in routes directory

## 4. Testing
- Check post renders correctly at `/blog/[slug]`
- Verify all images load properly
- Test responsive design

## 5. Deployment
- Commit changes
- Push to GitHub
- Netlify will auto-deploy
