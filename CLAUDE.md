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
│   ├── post.html      # Template for individual post pages
│   ├── archive.html   # Template for archive page (optional)
│   ├── tags.html      # Template for tags page (optional)
│   └── 404.html       # Template for 404 error page (optional)
├── dist/              # Generated static HTML (output, gitignored)
│   ├── *.html         # Generated HTML pages
│   ├── feed.xml       # RSS feed
│   ├── sitemap.xml    # Sitemap for search engines
│   └── styles.css     # Copied stylesheet
├── build.js           # Main build script - converts markdown to HTML
├── watch.js           # Development file watcher (auto-rebuild)
├── styles.css         # Global stylesheet (copied to dist/)
├── package.json       # Dependencies and scripts
├── netlify.toml       # Netlify deployment configuration
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
- Generates multiple pages:
  - Index page with post listings
  - Individual post pages
  - Archive page (if template exists)
  - Tags page (if template exists)
  - 404 error page (if template exists)
- Generates RSS feed (`feed.xml`)
- Generates sitemap (`sitemap.xml`)
- Copies CSS to dist folder
- Supports site configuration via environment variables
- Calculates reading time for posts
- Extracts excerpts from posts
- Supports draft posts (skipped during build)
- Parses dates from frontmatter or filename (YYYY-MM-DD format)
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
- Placeholders:
  - `{{POSTS}}` - Post listings HTML
  - `{{AUTHOR_BIO}}` - Author bio section (if configured)
  - `{{META_TAGS}}` - SEO meta tags
  - `{{TITLE}}` - Site title
- Simple string replacement in build.js

### `templates/post.html`
- Template for individual blog posts
- Placeholders:
  - `{{TITLE}}` - Post title
  - `{{DATE}}` - Post date (formatted)
  - `{{READING_TIME}}` - Estimated reading time
  - `{{TAGS}}` - Post tags (if any)
  - `{{CONTENT}}` - Post content (HTML)
  - `{{META_TAGS}}` - SEO meta tags
  - `{{SITE_TITLE}}` - Site title
- Includes navigation back to index

### `templates/archive.html` (optional)
- Template for archive page (grouped by year/month)
- Placeholders:
  - `{{SITE_TITLE}}` - Site title
  - `{{SITE_URL}}` - Site URL
  - `{{ARCHIVE_LIST}}` - Archive listings HTML
- Only generated if template exists

### `templates/tags.html` (optional)
- Template for tags page (all tags with associated posts)
- Placeholders:
  - `{{SITE_TITLE}}` - Site title
  - `{{SITE_URL}}` - Site URL
  - `{{TAGS_LIST}}` - Tags listings HTML
- Only generated if template exists

### `templates/404.html` (optional)
- Template for 404 error page
- Placeholders:
  - `{{SITE_TITLE}}` - Site title
  - `{{SITE_URL}}` - Site URL
- Only generated if template exists

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
tags: tag1, tag2, tag3
excerpt: Optional excerpt text
draft: false
---

Post content here...
```

- Frontmatter is parsed with simple regex (not a full YAML parser)
- If no frontmatter, filename (without .md) becomes the title
- Filename becomes the URL slug: `my-post.md` → `my-post.html`
- **Date parsing:**
  - Supports ISO format (YYYY-MM-DD) from frontmatter or filename
  - Supports common date formats (parsed via JavaScript Date)
  - If filename starts with YYYY-MM-DD, date is extracted automatically
  - Example: `2024-01-15-my-post.md` automatically extracts date
- **Tags:** Comma-separated or array format: `tags: tag1, tag2` or `tags: [tag1, tag2]`
- **Draft posts:** Set `draft: true` to exclude from build
- **Excerpt:** Optional excerpt in frontmatter, otherwise auto-extracted from content
- Posts are sorted by date (newest first), then by filename if no date

## Code Blocks

- **Inline code:** Styled with light gray background
- **Code blocks:** Monospace font, light gray background, border
- **No syntax highlighting:** CSS-only styling, no JavaScript libraries
- Use standard markdown syntax: ` ```language ` for blocks, `` `code` `` for inline

## Site Configuration

Site configuration is defined in `build.js` via `SITE_CONFIG` object and can be overridden with environment variables:

- `SITE_TITLE` - Site title (default: 'My Personal Blog')
- `SITE_URL` - Site URL (default: 'https://example.com')
- `SITE_DESCRIPTION` - Site description (default: 'A personal blog')
- `SITE_AUTHOR` - Author name (default: 'Author Name')
- `SITE_AUTHOR_BIO` - Author bio text
- `SITE_AUTHOR_AVATAR` - Path to author avatar image

Set via environment variables:
```bash
SITE_TITLE="My Blog" SITE_URL="https://example.com" npm run build
```

## Important Conventions

1. **No external templating engine:** Uses simple string replacement (`{{PLACEHOLDER}}`)
2. **Minimal dependencies:** Only `marked` for markdown parsing
3. **Static generation:** All HTML is generated at build time
4. **File watching:** Uses Node.js built-in `fs.watch`, no external libraries
5. **CSS-only styling:** No JavaScript for code highlighting or styling
6. **Simple frontmatter:** Basic key-value parsing, not full YAML
7. **Optional templates:** Archive, tags, and 404 pages are only generated if templates exist
8. **SEO support:** Automatic meta tags, Open Graph, and Twitter Card tags
9. **RSS feed:** Automatically generated at `dist/feed.xml`
10. **Sitemap:** Automatically generated at `dist/sitemap.xml`

## Common Tasks

### Adding a New Post

1. Create a `.md` file in `posts/` directory
2. Optionally add frontmatter with title, date, tags, excerpt
3. Write markdown content
4. Use `draft: true` in frontmatter to exclude from build
5. Run build: `npm run build` or use watch mode

**Example post:**
```markdown
---
title: My New Post
date: 2024-01-15
tags: programming, javascript
excerpt: A brief description of the post
---

Post content here...
```

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

## Generated Files

The build process generates the following files in `dist/`:

- `index.html` - Homepage with post listings
- `{slug}.html` - Individual post pages (one per markdown file)
- `archive.html` - Archive page (if template exists)
- `tags.html` - Tags page (if template exists)
- `404.html` - 404 error page (if template exists)
- `feed.xml` - RSS feed for all posts
- `sitemap.xml` - XML sitemap for search engines
- `styles.css` - Copied stylesheet

## Notes for AI Assistants

- **Template system:** Simple string replacement, not a full templating engine
- **Frontmatter parsing:** Basic regex-based, not YAML parser
- **File watching:** Uses Node.js built-in modules only
- **Code styling:** CSS-only, no syntax highlighting libraries
- **Build output:** Always goes to `dist/` directory
- **Docker:** Uses profiles to separate build/dev/prod services
- **Minimalism:** Project philosophy is to keep things simple and maintainable
- **Optional features:** Archive, tags, and 404 pages are optional (only built if templates exist)
- **Reading time:** Automatically calculated from post content (200 words/min)
- **Excerpts:** Auto-extracted from content if not provided in frontmatter
- **Draft posts:** Posts with `draft: true` are excluded from build
- **Date parsing:** Supports ISO dates (YYYY-MM-DD) from filename or frontmatter
- **Tags:** Supports comma-separated or array format in frontmatter
- **SEO:** Automatic meta tags, Open Graph, and Twitter Cards for all pages

When making changes:
- Preserve the minimal dependency approach
- Keep code simple and readable
- Maintain the static site generator pattern
- Test builds after changes
- Update this file if architecture changes significantly
