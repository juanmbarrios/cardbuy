# TCG Marketplace Platform

## Objective
Build a TCG marketplace web app as market infrastructure, not as a simple storefront. The platform must combine discovery, trust, payment protection, logistics, reputation, seller tooling, and SEO-driven content.

## Scope
The initial scope covers catalog, search, card pages, cart, checkout, payments, escrow, shipping, disputes, seller onboarding, inventory import, fraud controls, and SEO content pages. Community features, trading, fulfillment expansion, and advanced analytics are planned after the MVP.

## Architecture recommended
Use an API-first modular monolith with strict domain boundaries. Keep the frontend mobile-first and server-rendered for SEO-critical pages. Back the platform with a relational database, a dedicated search index, object storage for media, and an event queue for asynchronous workflows.

## Modules
- Catalog and taxonomy
- Search and faceted discovery
- Card detail pages
- Cart and checkout
- Payments and escrow
- Orders and shipping
- Trust and safety
- Seller portal
- Community layer
- SEO and content engine
- Admin and moderation tools

## Dependencies
- Catalog depends on a stable taxonomy.
- Search depends on normalized card, set, and seller data.
- Card pages depend on catalog, pricing, and stock services.
- Cart and checkout depends on live inventory and shipping calculations.
- Escrow depends on the payment provider and order state machine.
- Trust and safety depends on KYC, tracking, reputation, and dispute data.
- SEO depends on server rendering, clean URLs, and structured metadata.

## Order of construction
1. Foundations: auth, roles, database, logging, queue, storage, CI/CD.
2. Catalog: games, sets, cards, variants, conditions, seed data.
3. Search: indexing, filters, sorting, and card pages.
4. Seller tooling: onboarding, inventory import, editing, and listings.
5. Checkout: cart, totals, shipping, order creation, payment flow.
6. Escrow and risk: payment hold, release rules, KYC/KYB, dispute flow.
7. SEO and content: indexable pages, schema, internal linking, content types.
8. Community and retention: watchlists, reviews, alerts, activity feeds.
9. Scaling features: pricing automation, APIs, fulfillment options, regional expansion.

## Risks
- Fraud, falsification, and chargebacks.
- Poor catalog consistency across TCGs.
- Search latency or weak faceting.
- Overloaded UI that hurts conversion and SEO.
- Premature microservice split.
- Liquidity failure in the chosen initial niche.
- High operations cost if seller tooling is not automated early.

## Priorities

### P0
- Normalized catalog
- Powerful search
- Strong card detail pages
- Simple checkout
- Escrow and tracking
- KYC/KYB for sellers

### P1
- Seller portal
- Bulk import
- Reputation system
- Dispute handling
- SEO pages

### P2
- Community features
- Trading flows
- Fulfillment hybridization
- Pricing automation
- Multi-region expansion

## Proposed tasks
- Create the domain model and taxonomy for TCG products
- Set up platform foundations (auth, DB, logging, queue, CI/CD)
- Build catalog seed data and validation
- Implement search engine and faceted browsing
- Build card detail page with offers and pricing
- Implement multi-vendor cart and checkout
- Implement escrow payments and release logic
- Build seller onboarding with KYC/KYB
- Implement inventory import and management
- Add fraud detection, risk scoring and disputes
- Create SEO landing pages and content templates
- Add retention features such as watchlists and alerts
- Prepare platform for fulfillment and regional scaling