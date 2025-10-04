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
build/              # Build output directory
e2e/                # End-to-end tests
├── demo.test.ts

src/
├── app.css         # Global styles (Tailwind CSS imports only)
├── app.d.ts        # TypeScript declarations
├── app.html        # HTML template
├── demo.spec.ts    # Demo test file
├── lib/            # Shared components/utilities
│   ├── index.ts    # Library exports (empty placeholder file)
│   ├── Menu.svelte # Navigation component with hamburger menu
│   ├── utils.ts    # Utility functions (cn, flyAndScale transition)
│   └── assets/     # Static assets
│       ├── github.svg
│       └── blog/   # Blog content and assets
│           └── 2025-10-04-dotfiles.md
└── routes/         # Application routes (SvelteKit file-based routing)
    ├── +layout.svelte      # Root layout with Chrome DevTools suppression
    ├── +page.svelte        # Home page
    ├── 2025-10-04-test-post.md # Test blog post (markdown route)
    ├── about/
    │   └── +page.svelte    # About page
    └── .well-known/
        └── appspecific/
            └── com.chrome.devtools.json/
                └── +server.ts # Chrome DevTools suppression endpoint

static/             # Static assets (served at root)
├── ai.txt          # AI crawler instructions
├── logo.svg        # Site logo
├── manifest.json   # PWA manifest
├── robots.txt      # SEO robots file
└── sitemap.xml     # Site map for SEO

Root level:
├── .clinerules/    # Project rules and documentation
│   ├── blog-workflow.md    # Blog post creation workflow
│   ├── components.md       # Component documentation
│   └── memory-bank.md      # This file - project overview
├── .gitignore
├── .prettierrc     # Prettier configuration
├── docker-compose.yaml
├── eslint.config.js
├── Makefile        # Build automation
├── netlify.toml    # Netlify deployment config
├── package.json    # Node.js dependencies
├── package-lock.json
├── playwright.config.ts # E2E testing config
├── README.md
├── svelte.config.js    # SvelteKit configuration
├── tailwind.config.js  # Tailwind CSS configuration
├── tsconfig.json       # TypeScript configuration
└── vite.config.ts      # Vite build configuration
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
- **Build command**: `make build`
- **Publish directory**: `build`

## Recent Changes
- Updated memory bank with current project structure
- Added blog workflow documentation (`.clinerules/blog-workflow.md`)
- Added component documentation (`.clinerules/components.md`)
- Created test blog posts:
  - `2025-10-04-test-post.md` (markdown route)
  - `2025-10-04-dotfiles.md` (blog asset)
- Project uses modern web technologies (SvelteKit, TypeScript, Tailwind)
- Configured comprehensive project structure with proper file organization

## TODO
- [x] Document blog post creation workflow (`.clinerules/blog-workflow.md`)
- [ ] Add deployment checklist
- [x] Track custom components and their usage (`.clinerules/components.md`)
- [ ] Document environment variables if any
