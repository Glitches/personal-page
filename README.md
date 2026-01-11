# Personal Blog

A simple, maintainable markdown-based blog with minimal dependencies.

## Project Structure

```
personal-page/
├── posts/              # Markdown blog posts
├── templates/          # HTML templates
├── dist/              # Generated HTML (created on build)
├── build.js           # Build script
├── watch.js           # File watcher for development
├── styles.css         # Global stylesheet
├── package.json       # Dependencies
├── Dockerfile         # Production Docker image
├── Dockerfile.dev     # Development Docker image
├── docker-compose.yml # Docker Compose configuration
└── netlify.toml       # Netlify configuration
```

## Getting Started

### Option 1: Using Docker (Recommended)

**Prerequisites:** Docker and Docker Compose must be installed.

1. **Build the site once:**
```bash
docker-compose --profile build run --rm build
```
This generates static HTML files in the `dist/` folder.

2. **Development mode** (watches for changes, rebuilds automatically, and serves):
```bash
docker-compose --profile dev up
```
Visit http://localhost:3000

The dev server automatically rebuilds when you change:
- Markdown files in `posts/`
- HTML templates in `templates/`
- CSS in `styles.css`
- Build script `build.js`

To stop the dev server, press `Ctrl+C`.

3. **Production build:**
```bash
docker-compose --profile prod run --rm prod
```
This builds the site and outputs to `dist/` folder.

### Option 2: Local Development

1. Install dependencies:
```bash
npm install
```

2. Build the site:
```bash
npm run build
```

3. Preview locally:
```bash
npm run dev
```

4. Development with auto-rebuild (watches for changes):
```bash
npm run watch
```

## Writing Posts

Create markdown posts in the `posts/` folder:

```markdown
---
title: My Post Title
date: January 15, 2024
---

Your markdown content here...
```

**Guidelines:**
- Create `.md` files in the `posts/` folder
- Use frontmatter for metadata (title, date)
- Filename becomes the URL slug (e.g., `my-post.md` → `my-post.html`)
- Posts are sorted by filename (newest first, alphabetical)
- Frontmatter is optional - if omitted, the filename will be used as the title

## Code Blocks

Code blocks are styled with minimal CSS. Use standard markdown syntax:

````markdown
```javascript
const code = 'here';
```
````

## Deployment

### Netlify

The site is configured for Netlify:
- Build command: `npm run build`
- Publish directory: `dist`

Just connect your repository to Netlify and it will build automatically.

### Other Static Hosting

The `dist/` folder contains all static HTML files ready to deploy:
- Upload the contents of `dist/` to any static hosting service
- Or use the Docker build to generate the files in a containerized environment

## Dependencies

**Runtime:**
- `marked` - Markdown parser (single dependency)

**Development:**
- `serve` - Static file server (installed via npx, no package dependency)
- Node.js built-in modules for file watching (no additional dependencies)

## Customization

- **Styling:** Edit `styles.css` for global styles and code block appearance
- **Templates:** Edit HTML templates in `templates/` to change page structure
- **Build logic:** Modify `build.js` to customize how markdown is processed
- **Watch behavior:** Adjust `watch.js` to change file watching behavior

## Scripts

- `npm run build` - Build the site once
- `npm run dev` - Build and serve (one-time)
- `npm run watch` - Build, serve, and watch for changes (auto-rebuild)
