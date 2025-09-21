# Memory Bank - Personal Page Project

## Project Overview
- **Project Type**: Personal portfolio website
- **Framework**: SvelteKit
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Testing**: Playwright for e2e tests

## Key Configuration Files
- `Makefile` - Make file configuation
- `docker-compose.yaml` - Docker Compose configuration
- `svelte.config.js` - SvelteKit configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `vite.config.ts` - Vite build configuration
- `playwright.config.ts` - E2E testing configuration
- `netlify.toml` - Netlify deployment configuration

## Project Structure
```
src/
├── app.css          # Global styles
├── app.d.ts        # TypeScript declarations
├── app.html        # HTML template
├── lib/            # Shared components/utilities
│   ├── index.ts    # Library exports
│   ├── Menu.svelte # Navigation component
│   └── utils.ts    # Utility functions
└── routes/         # Application routes
    ├── +layout.svelte
    ├── +page.svelte
    ├── about/
    └── blog/
        ├── posts/  # Blog content
        └── [slug]/ # Dynamic blog routes

static/             # Static assets
├── logo.svg
├── manifest.json   # PWA manifest
├── robots.txt
├── sitemap.xml
└── ai.txt          # AI crawler instructions
```

## Content Management
- **Blog posts**: Located in `src/routes/blog/posts/` and `src/lib/assets/blog/`
- **Assets**: SVG icons and images in `src/lib/assets/`
- **Metadata**: Configured in static files for SEO

## Development Commands
- `make build` - Setup docker development container
- `make start` - Start development server
- `make dev` - Start development server
- `make shell` - Enter in container

## Deployment
- **Platform**: Netlify
- **Build command**: `npm run build`
- **Publish directory**: `build`

## Recent Changes
- Initialized memory bank tracking system
- Project uses modern web technologies (SvelteKit, TypeScript, Tailwind)

## TODO
- [ ] Document blog post creation workflow
- [ ] Add deployment checklist
- [ ] Track custom components and their usage
- [ ] Document environment variables if any
