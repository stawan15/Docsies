# Docsies

Docsies is a team documentation app for DevOps runbooks and technical guides. It supports Markdown and a Visual editor, syntax-highlighted code blocks, copy-to-clipboard controls, images with captions, authentication, and a scroll-synced table of contents.

## Stack

- Next.js App Router and TypeScript
- PostgreSQL and JWT-based email/password authentication
- MinIO or another S3-compatible object store for images
- Tailwind CSS
- `react-markdown`, `remark-gfm`, `rehype-pretty-code`, Shiki, and custom heading IDs
- Docker for local application packaging

## Local setup

Requirements: Node.js 20+, Docker Desktop, PostgreSQL, and MinIO.

1. Install dependencies and create local configuration:

   ```bash
   npm install
   cp .env.example .env.local
   ```

2. Replace every placeholder in `.env.local`. Never commit `.env.local`.

3. Start PostgreSQL and initialize the schema:

   ```bash
   psql "$DATABASE_URL" -f db/schema.sql
   ```

4. Create an editor account. The password is supplied only through your terminal and is not stored in the repository:

   ```bash
   node scripts/create-user.mjs user@example.com 'use-a-local-password' editor
   ```

5. Start MinIO. For persistent local storage, mount a host directory or named Docker volume to `/data`:

   ```bash
   docker run --name docsies-minio \
     --restart unless-stopped \
     -p 9000:9000 -p 9001:9001 \
     --mount type=bind,source=/absolute/path/to/minio-data,target=/data \
     -e MINIO_ROOT_USER=replace-with-your-access-key \
     -e MINIO_ROOT_PASSWORD=replace-with-your-secret-key \
     -d minio/minio server /data --console-address ":9001"
   ```

   Create a bucket named `doc-images` in the MinIO console at `http://localhost:9001`. If browser-readable images are desired in local development, give the bucket anonymous download access; do not grant anonymous write or delete access.

## Development

```bash
npm run dev
```

Open `http://localhost:3000`.

## Production build and Docker

```bash
npm run lint
npm run build
docker build --no-cache -t docsies -f dockerfile .
docker run --rm -p 3000:3000 --env-file .env.local docsies
```

When the app runs inside Docker while PostgreSQL and MinIO run on the host, use `host.docker.internal` for the internal service endpoints. Keep browser-facing public URLs on `localhost` where appropriate.

## Authoring

New documents open in Visual mode. The editor supports headings, emphasis, lists, image captions, and code blocks with a language selector. Markdown mode remains available for advanced authoring. Every rendered code block includes a Copy button.

Document slugs use lowercase English letters, numbers, and hyphens, for example `deploy-production`.

## Security notes

- `.env.local`, credentials, JWT secrets, object-storage data, and database dumps must stay local.
- Use strong, unique credentials outside local development.
- Do not grant public write access to an object-storage bucket.
- Treat uploaded documentation as team content and review HTML/Markdown input before broadening access.

## Verification

```bash
npm run lint
npm run build
```
