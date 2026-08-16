# AGENTS.md

## Project

Docsies is a team documentation website for DevOps runbooks. It supports authenticated document browsing, Markdown and Visual authoring, syntax-highlighted code blocks, image uploads with captions, and a scroll-synced table of contents.

## Stack

- Next.js App Router with TypeScript
- PostgreSQL for application data
- JWT email/password sessions
- MinIO or another S3-compatible object store for images
- Tailwind CSS
- `react-markdown` + `remark-gfm` + `rehype-pretty-code` + Shiki + custom heading IDs

Do not replace the selected stack without explicit user approval.

## Safety and secrets

1. Never commit `.env.local`, passwords, JWT secrets, access keys, object-storage data, database dumps, or personal paths.
2. Use `.env.example` and `.env.local.example` with placeholders only.
3. Never print secret values while diagnosing configuration.
4. Do not grant anonymous write/delete access to object storage.
5. Before publishing the repository, inspect `git diff --cached` and `git status` for personal information and generated data.

## Database

1. Schema changes must be made through reviewed SQL under `db/`.
2. Do not drop or alter existing data without explicit approval and a backup plan.
3. Keep authorization checks in API routes and verify role-protected mutations.

## Working practices

1. Work in small, verifiable steps.
2. Run `npm run lint` and `npm run build` after meaningful changes.
3. Preserve unrelated user changes.
4. Explain assumptions when making product or UX decisions.
5. Keep documentation and environment examples synchronized with the actual implementation.

## Current behavior

- New documents default to Visual mode; Markdown mode remains available.
- Visual code blocks are converted to fenced Markdown on save so syntax highlighting and Copy buttons use one rendering path.
- Slugs accept lowercase English letters, numbers, and hyphens only.
- Editors and admins can create, edit, delete, publish documents, and upload images.

## Definition of done

- `npm run lint` and `npm run build` pass.
- No credentials or personal data are tracked.
- Unauthenticated users cannot access `/docs/*`.
- Role-protected document mutations return authorization errors for unauthorized users.
- A document with headings, code, an image, and a caption renders correctly.
