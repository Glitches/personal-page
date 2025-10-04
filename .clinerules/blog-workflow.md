# Blog Post Creation Workflow

## Creating New Blog Posts

### 1. Create Markdown File
Location: `src/lib/assets/blog/YYYY-MM-DD-slug.md`

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

## 3. Generate Route
The system will automatically create routes for blog posts based on the filename slug.

## 4. Testing
- Check post renders correctly at `/blog/[slug]`
- Verify all images load properly
- Test responsive design

## 5. Deployment
- Commit changes
- Push to GitHub
- Netlify will auto-deploy
