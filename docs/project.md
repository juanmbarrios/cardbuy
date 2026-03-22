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
- Cart and checkout depend on live inventory and shipping calculations.
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
- Create the domain model and taxonomy for TCG products.
- Implement the catalog and card detail surfaces.
- Build the search index and faceted browsing.
- Define the order, payment, and escrow state machines.
- Deliver the seller onboarding and inventory import flow.
- Add fraud controls, KYC/KYB, and disputes.
- Produce SEO landing pages and editorial templates.
- Add retention features such as watchlists and alerts.
- Prepare the platform for future fulfillment and regional scaling.

## Automation manifest
```json
{
  "schema_version": "1.0",
  "project_name": "TCG Marketplace Platform",
  "repo_name": "tcg-marketplace",
  "default_branch": "main",
  "areas": [
    { "id": "foundation", "name": "Foundation" },
    { "id": "catalog", "name": "Catalog" },
    { "id": "search", "name": "Search" },
    { "id": "marketplace", "name": "Marketplace" },
    { "id": "trust", "name": "Trust & Safety" },
    { "id": "seller", "name": "Seller Tools" },
    { "id": "seo", "name": "SEO & Content" },
    { "id": "community", "name": "Community" },
    { "id": "admin", "name": "Admin" }
  ],
  "tasks": [
    {
      "id": "T001",
      "title": "Define domain model and TCG taxonomy",
      "area": "catalog",
      "priority": "P0",
      "size": "M",
      "depends_on": [],
      "description": "Design canonical entities for games, sets, cards, variants, conditions, languages, and seller-facing inventory records.",
      "acceptance": [
        "Core entities documented",
        "Multi-TCG support without branching",
        "Variants normalized"
      ],
      "subtasks": [
        "Define entities",
        "Document attributes",
        "Normalize cross-game"
      ]
    },
    {
      "id": "T002",
      "title": "Set up platform foundations",
      "area": "foundation",
      "priority": "P0",
      "size": "M",
      "depends_on": [],
      "description": "Setup auth, DB, logging, queue, CI/CD.",
      "acceptance": [
        "Auth works",
        "Migrations stable",
        "Queue operational"
      ],
      "subtasks": [
        "Init repo",
        "Auth system",
        "CI/CD"
      ]
    },
    {
      "id": "T003",
      "title": "Build catalog seed",
      "area": "catalog",
      "priority": "P0",
      "size": "M",
      "depends_on": ["T001", "T002"],
      "description": "Load initial data and validation.",
      "acceptance": [
        "Seed data loaded",
        "Validation works",
        "Queryable catalog"
      ],
      "subtasks": [
        "Import format",
        "Seed scripts",
        "APIs"
      ]
    },
    {
      "id": "T004",
      "title": "Search and faceting",
      "area": "search",
      "priority": "P0",
      "size": "L",
      "depends_on": ["T003"],
      "description": "Implement search engine and filters.",
      "acceptance": [
        "Fast queries",
        "Facets available",
        "Sorting works"
      ],
      "subtasks": [
        "Index schema",
        "Index jobs",
        "Query API"
      ]
    },
    {
      "id": "T005",
      "title": "Card detail page",
      "area": "search",
      "priority": "P0",
      "size": "L",
      "depends_on": ["T004"],
      "description": "Build full card page with offers and pricing.",
      "acceptance": [
        "Pricing visible",
        "Offers listed",
        "CTA clear"
      ],
      "subtasks": [
        "Layout",
        "Pricing",
        "SEO"
      ]
    },
    {
      "id": "T006",
      "title": "Cart and checkout",
      "area": "marketplace",
      "priority": "P0",
      "size": "L",
      "depends_on": ["T005"],
      "description": "Multi-vendor cart and checkout.",
      "acceptance": [
        "Multi-seller cart",
        "Clear totals",
        "Order created"
      ],
      "subtasks": [
        "Cart model",
        "Shipping calc",
        "Checkout flow"
      ]
    },
    {
      "id": "T007",
      "title": "Escrow payments",
      "area": "marketplace",
      "priority": "P0",
      "size": "L",
      "depends_on": ["T006"],
      "description": "Hold and release funds.",
      "acceptance": [
        "Tracked states",
        "Release rules",
        "Refund flow"
      ],
      "subtasks": [
        "State machine",
        "Rules",
        "Logs"
      ]
    },
    {
      "id": "T008",
      "title": "Seller onboarding",
      "area": "seller",
      "priority": "P0",
      "size": "M",
      "depends_on": ["T002"],
      "description": "KYC/KYB onboarding.",
      "acceptance": [
        "Data captured",
        "Verification gating",
        "Permissions enforced"
      ],
      "subtasks": [
        "Forms",
        "KYC",
        "Permissions"
      ]
    },
    {
      "id": "T009",
      "title": "Inventory import",
      "area": "seller",
      "priority": "P1",
      "size": "L",
      "depends_on": ["T008"],
      "description": "CSV import and management.",
      "acceptance": [
        "Bulk upload",
        "Errors shown",
        "Editable inventory"
      ],
      "subtasks": [
        "CSV format",
        "Importer",
        "Dashboard"
      ]
    },
    {
      "id": "T010",
      "title": "Fraud and disputes",
      "area": "trust",
      "priority": "P0",
      "size": "L",
      "depends_on": ["T007"],
      "description": "Risk scoring and disputes.",
      "acceptance": [
        "Risk flags",
        "Dispute flow",
        "Evidence storage"
      ],
      "subtasks": [
        "Risk rules",
        "Disputes",
        "Moderation"
      ]
    }
  ]
}