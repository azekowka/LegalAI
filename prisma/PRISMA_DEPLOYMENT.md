# Prisma Deployment Instructions for Vercel

When deploying the LegalAI application to Vercel, it is crucial to apply Prisma database migrations to ensure your database schema is up-to-date with your application's models.

## Automatic Migrations with Vercel Build Step

For most deployments, you can integrate the Prisma Migrate Deploy command directly into your Vercel build process. This ensures that migrations are applied automatically every time you deploy.

**1. Add a Post-build Script (Recommended for Vercel):**

You can add a `postbuild` script to your `apps/web/package.json` that runs `prisma migrate deploy`. Vercel automatically runs `postbuild` scripts after `next build` is completed.

```json
// apps/web/package.json
{
  // ...
  "scripts": {
    "dev": "next dev --turbopack --port=3001",
    "build": "next build",
    "postbuild": "prisma migrate deploy", // Add this line
    "start": "next start",
    "lint": "next lint",
    "knip": "knip"
  },
  // ...
}
```

**2. Ensure DATABASE_URL Environment Variable is Set:**

Prisma needs to connect to your database to apply migrations. Make sure you have the `DATABASE_URL` environment variable configured in your Vercel project settings. This variable should contain the connection string to your PostgreSQL database.

*   **Vercel Dashboard:** Go to your project settings on Vercel -> Environment Variables -> Add `DATABASE_URL` with your database connection string.

## Manual Migrations (Alternative/Troubleshooting)

In some cases, you might need to apply migrations manually or for more complex scenarios (e.g., specific database environments, troubleshooting).

**1. Install Prisma CLI Globally (if not already):**

If you're running migrations locally or outside of the Vercel build process, ensure you have the Prisma CLI installed.

```powershell
pnpm add -g prisma
```

**2. Apply Migrations:**

Navigate to the `apps/web` directory where your `schema.prisma` is located, and run the migrate deploy command. Ensure your `DATABASE_URL` environment variable is set locally before running this command.

```powershell
cd apps/web
$env:DATABASE_URL="your_database_connection_string" # For PowerShell
prisma migrate deploy
```

**Important Notes:**

*   **Database Backups:** Always back up your production database before applying migrations.
*   **Zero-Downtime Deployments:** For production environments with high traffic, consider using advanced deployment strategies that minimize downtime during migrations (e.g., blue-green deployments).
*   **Review Migrations:** Before deploying, always review the generated SQL for your migrations to understand the changes that will be applied to your database. You can do this with `prisma migrate diff`.

By following these instructions, you can ensure your Prisma migrations are correctly applied during your Vercel deployments.
