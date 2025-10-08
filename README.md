# LegalAI

## Features

- **TypeScript** - For type safety and improved developer experience
- **Next.js** - Full-stack React framework
- **TailwindCSS** - Utility-first CSS for rapid UI development
- **shadcn/ui** - Reusable UI components
- **Node.js** - Runtime environment
- **Turborepo** - Optimized monorepo build system

## Getting Started

First, install the dependencies:

```bash
pnpm i
```

Then, initialize prisma & configurate database:

```bash
npx prisma validate
npx prisma generate
npx prisma db push
npx prisma db pull
```

Run the development server:

```bash
pnpm next dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the web application.

## Available Scripts

- `pnpm dev`: Start all applications in development mode
- `pnpm build`: Build all applications
- `pnpm dev:web`: Start only the web application
- `pnpm dev:server`: Start only the server
- `pnpm check-types`: Check TypeScript types across all apps
- `pnpm dlx taze -r`: Update all dependencies
- `pnpm next dev`: Next dev работает на Webpack, а next dev --turbo включает Turbopack.

## API tests
- http://localhost:3000/api/test-auth - Authorized user
- http://localhost:3000/api/migrate-documents - All the documents in current DB