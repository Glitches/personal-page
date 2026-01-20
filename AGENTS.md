# AGENTS.md - Guidelines for AI Assistants

This document provides guidelines for AI assistants working on this static blog generator project.

## Project Overview

A minimal, maintainable markdown-based static blog generator. The project prioritizes simplicity, minimal dependencies (only `marked` for markdown parsing), and ease of maintenance.

## Build Commands

### Core Commands
```bash
npm run build          # One-time static site build
npm run dev            # Build and serve on port 3000
npm run watch          # Development mode with auto-rebuild on file changes
```

### Docker Commands
```bash
docker-compose --profile build run --rm build   # Build once in container
docker-compose --profile dev up                 # Dev mode with auto-rebuild
docker-compose --profile prod run --rm prod     # Production build
```

### Environment Variables
```bash
SITE_TITLE="My Blog" \
SITE_URL="https://example.com" \
SITE_DESCRIPTION="Description" \
SITE_AUTHOR="Author Name" \
SITE_AUTHOR_BIO="Bio text" \
SITE_AUTHOR_AVATAR="avatar.jpg" \
GOOGLE_ANALYTICS_ID="G-XXXXXXXXXX" \
npm run build
```

## Code Style Guidelines

### Language
- Plain JavaScript (CommonJS, no ES modules)
- No TypeScript unless explicitly requested
- No external dependencies beyond `marked`

### Imports
```javascript
const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
```
- Use `require()` for all imports
- Destructure named imports from packages

### Naming Conventions
- **Variables/functions**: `camelCase` (e.g., `parseFrontmatter`, `markdownFiles`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `POSTS_DIR`, `SITE_CONFIG`)
- **Filenames**: `kebab-case` (e.g., `build.js`, `watch.js`)

### Functions
- Keep functions focused and under 100 lines when possible
- Use descriptive names that indicate purpose
- Use early returns to avoid deep nesting
- Handle errors gracefully with try/catch

### Error Handling
```javascript
try {
  // operation
} catch (error) {
  console.error(`Error message: ${error.message}`);
  // Return null or throw as appropriate
}
```
- Always log errors with context
- Return `null` for failed operations that can be filtered
- Use `process.exit(1)` only for fatal build failures

### String Handling
- Use template literals for string interpolation
- Use `escapeHtml()` for all user-generated content (prevents XSS)
- Use `escapeXml()` for RSS feed content

### Template System
- Templates use simple `{{PLACEHOLDER}}` replacement
- Use `replace(/\{\{KEY\}\}/g, value)` for global replacement
- Use `replace('{{KEY}}', value)` for single replacement

### File Operations
- Always check if files exist before reading
- Use `fs.existsSync()` for critical checks
- Use `recursive: true` for directory creation
- Handle optional template files gracefully (try/catch)

## CSS Guidelines

### Structure
- Use CSS custom properties (`:root`) for theme values
- Group related styles logically
- Use meaningful class names (e.g., `.post-preview`, `.author-bio`)
- Support dark mode via CSS `:has()` selector

### Properties
```css
.element {
  --bg-color: #fff;
  background-color: var(--bg-color);
  color: var(--text-color);
}
```

## Markdown Post Format

```markdown
---
title: Post Title
date: 2024-01-15
tags: tag1, tag2, tag3
excerpt: Optional excerpt
draft: false
---

Content here...
```

- Frontmatter is parsed with simple regex (not full YAML)
- Filename becomes URL slug: `my-post.md` → `my-post.html`
- Date can be in frontmatter or filename (`2024-01-15-my-post.md`)
- Draft posts (`draft: true`) are excluded from builds

## Architecture Notes

### Build Process
1. Read markdown files from `posts/`
2. Parse frontmatter and content
3. Convert markdown to HTML via `marked`
4. Generate HTML pages using template replacement
5. Output to `dist/` directory

### Generated Files
- `index.html` - Homepage with post listings
- `{slug}.html` - Individual post pages
- `archive.html` - Archive page (if template exists)
- `tags.html` - Tags page (if template exists)
- `404.html` - 404 page (if template exists)
- `feed.xml` - RSS feed
- `sitemap.xml` - XML sitemap
- `styles.css` - Copied stylesheet

## Key Functions

### Core Build Functions
- `parseFrontmatter(content)` - Extract metadata from markdown
- `getMarkdownFiles()` - Get sorted list of posts
- `buildPost(fileInfo)` - Generate individual post HTML
- `buildIndex(posts)` - Generate homepage
- `buildRSSFeed(posts)` - Generate RSS feed
- `buildSitemap(posts)` - Generate sitemap

### Utility Functions
- `calculateReadingTime(markdown)` - Estimate read time
- `extractExcerpt(content, metadata)` - Get post excerpt
- `parseDate(dateString, filename)` - Parse dates flexibly
- `escapeHtml(text)` - Prevent XSS in HTML
- `escapeXml(text)` - Escape XML special characters

## Development Workflow

1. Make changes to source files (build.js, watch.js, styles.css, templates/, or posts/)
2. Run `npm run build` to generate HTML
3. Check `dist/` for output
4. Use `npm run watch` for auto-rebuild during development

## Important Conventions

- Minimal dependencies - avoid adding packages
- Static generation - all HTML at build time
- CSS-only styling - no JavaScript for code highlighting
- Simple frontmatter - basic key-value parsing only
- Optional templates - archive/tags/404 only generated if they exist
- No external CDN links in templates (inline or local only)
