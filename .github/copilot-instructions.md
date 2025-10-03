## GitHub Copilot Instructions for Payload/Next.js App

### Project Overview

This project is a Next.js application integrated with Payload CMS, using TypeScript, Tailwind CSS, and a modular folder structure. It includes custom authentication, API routes, and a component-based frontend.

### General Guidelines

- Use TypeScript for all new code.
- Follow the existing folder structure: keep frontend code in `src/app/(frontend)` and admin/CMS code in `src/app/(payload)`.
- Use functional React components and hooks.
- Use Tailwind CSS for styling. Place global styles in `globals.css` and custom admin styles in `custom.scss`.
- Place shared UI components in `src/components/ui` and providers in `src/components/providers`.
- Use Payload collections for data models. Define new collections in `src/collections`.
- Use Next.js API routes for backend logic in `src/app/api`.
- Use `src/app/actions` for server actions (e.g., authentication, registration, search).
- Use pnpm for package management.

### Naming Conventions

- Use PascalCase for React components and collections (e.g., `CompanySidebar.tsx`, `Investment.ts`).
- Use camelCase for variables and functions.
- Use kebab-case for route folders (e.g., `update-stock-data`).

### Authentication

- Use NextAuth for authentication. Auth logic is in `src/app/api/auth/[...nextauth]/route.ts` and helpers in `src/lib/auth.ts`.
- Use `SessionProvider` from `src/components/providers/SessionProvider.tsx` for session context.

### Data Models

- Define new Payload collections in `src/collections`.
- Update `payload-types.ts` and `payload-generated-schema.ts` as needed when collections change.

### API & Actions

- Place custom API endpoints in `src/app/api`.
- Use server actions for business logic in `src/app/actions`.

### Frontend

- Place page components in `src/app/(frontend)`.
- Use the `components` subfolder for shared UI and layout components.
- Use the `stock/[ticker]/page.tsx` pattern for dynamic stock pages.

### Admin (Payload)

- Place admin UI and customizations in `src/app/(payload)`.
- Use `custom.scss` for admin-specific styles.

### Migrations

- Place migration scripts in `src/migrations`.
- Use timestamped filenames for new migrations.

### Testing & Linting

- Follow existing linting and formatting rules (see `package.json`, `tsconfig.json`).

### Other Recommendations

- Use environment variables for secrets and configuration.

---

For more details, refer to the existing codebase and folder structure. Follow these conventions to ensure consistency and maintainability.
