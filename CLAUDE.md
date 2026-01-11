# Claude Project Context

This document provides context and guidelines for AI assistants working on this project.

## Project Overview

A minimal, maintainable markdown-based static blog generator. The project prioritizes simplicity, minimal dependencies, and ease of maintenance for a personal website.

**Key Principles:**
- Minimal dependencies (only `marked` for markdown parsing)
- Simple, maintainable code structure
- Server-side rendering at build time (static HTML generation)
- CSS-only code styling (no JavaScript syntax highlighting)
- Docker support for consistent development and deployment

## Architecture

### Build Process

1. **Input:** Markdown files in `posts/` directory
2. **Processing:** `build.js` reads markdown files, parses frontmatter, converts to HTML
3. **Output:** Static HTML files in `dist/` directory
4. **Templates:** HTML templates in `templates/` directory are used to wrap content

### File Structure

```
personal-page/
├── posts/              # Source markdown files (input)
│   └── *.md           # Blog posts with optional frontmatter
├── templates/          # HTML templates
│   ├── index.html     # Template for index page (post listing)
│   └── post.html      # Template for individual post pages
├── dist/              # Generated static HTML (output, gitignored)
├── build.js           # Main build script - converts markdown to HTML
├── watch.js           # Development file watcher (auto-rebuild)
├── styles.css         # Global stylesheet (copied to dist/)
├── package.json       # Dependencies and scripts
├── Dockerfile         # Production Docker image
├── Dockerfile.dev     # Development Docker image with watch support
└── docker-compose.yml # Docker services configuration
```

## Key Files

### `build.js`
- Main build script
- Reads markdown files from `posts/`
- Parses frontmatter (YAML-style metadata)
- Converts markdown to HTML using `marked`
- Generates index page with post listings
- Copies CSS to dist folder
- **Important:** Uses simple string replacement for templates (not a full templating engine)

### `watch.js`
- Development file watcher
- Uses Node.js `fs.watch` (no external dependencies)
- Watches `posts/`, `templates/`, and root directory
- Debounces rebuilds (500ms delay)
- Automatically rebuilds and serves on file changes
- Serves on port 3000

### `templates/index.html`
- Template for homepage
- Contains `{{POSTS}}` placeholder for post listings
- Simple string replacement in build.js

### `templates/post.html`
- Template for individual blog posts
- Contains `{{TITLE}}`, `{{DATE}}`, and `{{CONTENT}}` placeholders
- Includes back link to index

### `styles.css`
- Global stylesheet
- CSS-only code block styling (no syntax highlighting)
- Responsive design
- Simple, clean aesthetic

## Development Workflow

### Local Development

1. **One-time build:**
   ```bash
   npm run build
   ```

2. **Development with auto-rebuild:**
   ```bash
   npm run watch
   ```
   Serves on http://localhost:3000 and rebuilds on file changes

3. **One-time build and serve:**
   ```bash
   npm run dev
   ```

### Docker Development

1. **Build once:**
   ```bash
   docker-compose --profile build run --rm build
   ```

2. **Development mode (auto-rebuild):**
   ```bash
   docker-compose --profile dev up
   ```

3. **Production build:**
   ```bash
   docker-compose --profile prod run --rm prod
   ```

## Markdown Post Format

Posts support optional frontmatter:

```markdown
---
title: Post Title
date: January 15, 2024
---

Post content here...
```

- Frontmatter is parsed with simple regex (not a full YAML parser)
- If no frontmatter, filename (without .md) becomes the title
- Filename becomes the URL slug: `my-post.md` → `my-post.html`
- Posts are sorted by filename (newest first, alphabetical)

## Code Blocks

- **Inline code:** Styled with light gray background
- **Code blocks:** Monospace font, light gray background, border
- **No syntax highlighting:** CSS-only styling, no JavaScript libraries
- Use standard markdown syntax: ` ```language ` for blocks, `` `code` `` for inline

## Important Conventions

1. **No external templating engine:** Uses simple string replacement (`{{PLACEHOLDER}}`)
2. **Minimal dependencies:** Only `marked` for markdown parsing
3. **Static generation:** All HTML is generated at build time
4. **File watching:** Uses Node.js built-in `fs.watch`, no external libraries
5. **CSS-only styling:** No JavaScript for code highlighting or styling
6. **Simple frontmatter:** Basic key-value parsing, not full YAML

## Common Tasks

### Adding a New Post

1. Create a `.md` file in `posts/` directory
2. Optionally add frontmatter with title and date
3. Write markdown content
4. Run build: `npm run build` or use watch mode

### Modifying Styles

1. Edit `styles.css`
2. Rebuild (or let watch mode handle it)
3. CSS is copied to `dist/` during build

### Changing Templates

1. Edit files in `templates/` directory
2. Use `{{PLACEHOLDER}}` syntax for dynamic content
3. Rebuild to see changes

### Adding Features

- **Keep it simple:** Prefer simple solutions over complex ones
- **Minimal dependencies:** Avoid adding new packages unless necessary
- **Static generation:** Remember this is a static site generator
- **Maintainability:** Code should be easy to understand and modify

## Deployment

- **Netlify:** Configured via `netlify.toml`
  - Build command: `npm run build`
  - Publish directory: `dist`
- **Other static hosts:** Upload contents of `dist/` folder
- **Docker:** Can build in containerized environment

## Testing Changes

1. Make changes to source files
2. Run `npm run build` to generate HTML
3. Check `dist/` folder for output
4. Use `npm run watch` for development with auto-rebuild
5. Or use Docker dev mode for containerized development

## Notes for AI Assistants

- **Template system:** Simple string replacement, not a full templating engine
- **Frontmatter parsing:** Basic regex-based, not YAML parser
- **File watching:** Uses Node.js built-in modules only
- **Code styling:** CSS-only, no syntax highlighting libraries
- **Build output:** Always goes to `dist/` directory
- **Docker:** Uses profiles to separate build/dev/prod services
- **Minimalism:** Project philosophy is to keep things simple and maintainable

When making changes:
- Preserve the minimal dependency approach
- Keep code simple and readable
- Maintain the static site generator pattern
- Test builds after changes
- Update this file if architecture changes significantly
