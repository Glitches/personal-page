# Personal Page

A personal website and blog built with SvelteKit, featuring a clean design with Tailwind CSS and Docker containerization for easy deployment.

## Project Overview

This is a personal website and blog built with SvelteKit, featuring:
- **Blog functionality** with markdown post support
- **Responsive design** powered by Tailwind CSS
- **Docker containerization** for easy deployment
- **Modern tooling** with TypeScript, ESLint, and Prettier
- **Testing setup** with Playwright for end-to-end tests

## Development

### Using Docker (Recommended)

The project includes a complete Docker setup for development and deployment:

```bash
# Build and start all services
make build up

# Start services (after build)
make start

# Stop services
make stop

# View logs and access container
make shell

# Restart services
make restart

# Run development server in container
make dev
```

### Local Development

For local development without Docker:

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
# Build using Docker
make build

# Or build locally
npm run build
```

You can preview the production build with `npm run preview`.

## Deployment

The project includes configurations for:
- **Netlify** (`netlify.toml`)
- **Docker** deployment ready
- **Static site** generation support

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
