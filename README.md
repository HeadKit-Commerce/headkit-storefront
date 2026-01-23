# HeadKit Store Template

A modern, headless e-commerce storefront built with Next.js 16 and WooCommerce, powered by the HeadKit API.

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org) with App Router and Turbopack
- **React**: 19.2
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com) with custom theming
- **UI Components**: [Radix UI](https://www.radix-ui.com) primitives
- **Forms**: [React Hook Form](https://react-hook-form.com) + [Zod](https://zod.dev) validation
- **Payments**: [Stripe](https://stripe.com) integration
- **Data**: GraphQL with code generation
- **State Management**: [TanStack Query](https://tanstack.com/query)

## Features

- Product catalog with filtering and sorting
- Collection/category pages
- Product search
- Shopping cart
- Checkout with Stripe payments
- User authentication (login/register)
- Account management (orders, profile, wishlist)
- Blog/news section
- Brand pages
- FAQ pages
- Contact forms
- Gift card support
- Wholesale section
- SEO optimized with metadata
- Responsive design

## Getting Started

### Prerequisites

- Node.js 20+ (see `.nvmrc`)
- pnpm
- HeadKit API credentials

### Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
cp .env.example .env.local
```

Required variables:

| Variable | Description |
|----------|-------------|
| `IMAGE_DOMAIN` | Domain for remote images (WooCommerce media) |
| `NEXT_PUBLIC_HEADKIT_API_GRAPHQL_ENDPOINT` | HeadKit GraphQL API endpoint |
| `HEADKIT_API_TOKEN` | HeadKit API authentication token |
| `NEXT_PUBLIC_FRONTEND_URL` | Your frontend URL (e.g., `http://localhost:3000`) |

### Installation

```bash
# Install dependencies
pnpm install

# Generate GraphQL types (requires .env.local)
pnpm generate

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the store.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── account/           # User account pages
│   ├── brand/             # Brand listing and detail
│   ├── checkout/          # Checkout flow
│   ├── collections/       # Product collections
│   ├── news/              # Blog/news articles
│   ├── shop/              # Product catalog
│   └── ...
├── components/            # React components
│   ├── checkout/          # Checkout components
│   ├── collection/        # Collection/filtering
│   ├── product/           # Product display
│   ├── ui/                # Base UI components
│   └── ...
├── contexts/              # React contexts
├── hooks/                 # Custom hooks
├── lib/
│   ├── headkit/           # HeadKit API client
│   │   ├── actions/       # Server actions
│   │   ├── fragments/     # GraphQL fragments
│   │   ├── mutations/     # GraphQL mutations
│   │   ├── queries/       # GraphQL queries
│   │   └── generated/     # Generated types
│   └── stripe/            # Stripe utilities
└── types/                 # TypeScript types
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server with Turbopack |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm generate` | Generate GraphQL types from schema |

## Configuration

### HeadKit Config

Edit `src/headkit.config.ts` to customize:

- Site metadata (name, description, colors)
- Fallback images
- Route slugs (collections, products, articles)

### Next.js Config

Edit `next.config.ts` for:

- Image optimization settings
- Remote image domains

## Deployment

Deploy to [Vercel](https://vercel.com) for the best experience:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/HeadKit-Commerce/headkit-storefront)

Or build and run anywhere:

```bash
pnpm build
pnpm start
```

## License

Private - All rights reserved.
