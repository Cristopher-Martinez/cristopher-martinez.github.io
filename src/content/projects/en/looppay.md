---
name: LoopPay — payments platform
lang: en
status: closed
summary: 'Four years on the systems that move money: bulk dispersals and their reversal, provider webhook integrations, balance reconciliation, rate limiting and audit trails.'
stack: [TypeScript, GraphQL, Prisma, PostgreSQL, AWS Lambda, OpenTelemetry, React, React Native]
stats:
  - { value: '4', label: 'years' }
  - { value: '~40', label: 'engineers' }
  - { value: '12', label: 'rails integrated' }
order: 0
---

Money in, money out, and everything that has to hold when it does not go through
the first time. I work across the stack — React on the front, a GraphQL and
Prisma API behind it, AWS Lambda deployed through CDK, CI pipelines and
end-to-end suites — inside an engineering group of roughly forty.

I worked on four products in the same family: **the Loopay platform** — the
base for the white-label brands **Masari** and **SuperPay** —, **Bico**, a
parallel product, **the Bico mobile app**, and **a new suite** with its own
backend.

## Timeline

What follows is what I built, by year, at module level. The code is private;
this is the class of problem and the decision, never the implementation.

### 2022 — in through the backoffice

Three months in, I was already on the money-out side.

- **Document management and KYC** in the backoffice: documents area, KYC upload,
  alerts on re-upload.
- **First payment rail: Wompi**, checkout widget and its webhook.
- **Payouts v1**: bank-account validation on bulk dispersals, tags on single and
  bulk payouts, alerts on rejections.
- **Scheduled dispersals**: calendar and deferred payouts, back and front.
- Email engine on Mailjet; Ecuadorian bank accounts.

### 2023 — notifications, payin, and webhooks as a product

The year the platform stopped being only money-out.

- **Notification engine**: email, per-payout user notifications, Twilio as a
  delivery channel; **migration from Mailjet to Sendinblue**.
- **Top-up (payin)**: new interface, and **Kushki** as the second rail, wired
  into the top-up module.
- **Managed payouts** with a summary before approval; company admins can see
  their clients' balances.
- **Collection sources**: a three-step builder to onboard and configure a
  collection source, with currency formatting and phone validation. The new
  top-up module was built on top of it.
- **Webhooks as a product**: each company registers its own URL with an encrypted
  secret, dispatch hooks into payin and payout, and a log model records every
  delivery. It closed with a **general webhook on a strategy pattern** —
  [the log entry](/bitacora/webhook-strategy/) says why.
- Eighty-four test commits that year. It was the year I learned not to trust the
  happy path.

### 2024 — cross-border and compliance

- **Cross-border**: backoffice, transactions, contacts, an amount-conversion
  service and **currency-pair validation** per country.
- **Three new rails**: Payphone, Transfiya (Excel upload) and Epayco; Payoneer
  cashout templates.
- **Lifecycle webhooks**: payout, cash-in and cash-out expiry, Iris.
- **Beneficiaries** as their own entity: create, edit, account and type
  validation, tag filters.
- **Payout builder refactor**, with file upload.
- **Compliance**: backoffice badges and mutation, approval module, legal
  agreement signing, extra onboarding fields.
- **Blocklist and a payout validator engine**, wired into the service and into
  bulk dispersal.
- Pagination, search and filters on the tables people actually used.

### 2025 — Bico as a product, and a mobile app from scratch

- **Bico**: collection sources, self-payin, external payin and company-status
  webhooks, **pocket** products, its own registration, company scaffolds and
  document tabs.
- **Iris** as a collection method, with its own collection engine.
- **Fireblocks**: a crypto-custody webhook that creates the payin.
- **The Bico mobile app, from scratch**: fast checkout, pockets, **Banco
  Agrario** accounts and credit notes, **PSE**, quick transfer, statements, a
  single trusted device, sign-out on inactivity and on time in background.
- **New suite**: a COP payout builder on **Bre-B**, the instant-payments system;
  bank and document-type modules; payin and payout listings per company.
- Public API: automatic payout rejection as an option.

### 2026 — scale, reversals and regulatory work

The year the work became platform work.

- **Five performance phases**: query optimisation, **cursor-based pagination**
  on exports, and **CloudWatch alarms with a health endpoint**.
- **Bulk dispersals at the scale of the entire wallet base.**
- **Bulk refunds** with file upload, and the **complete bulk payin reversal
  module**, with per-batch history and live status. The queue moved from Redis
  to Postgres — [the log entry](/bitacora/mass-reversal-queue/) explains why.
- **Manual capture** of dispersals and refunds, with **mandatory approval before
  money moves**.
- **Duplicate prevention** across dispersals, refunds and institutional
  collections (Fogafín).
- **Wallets under court orders**: release guidance, filters and export.
- **Accounting**: inbound and outbound rules, filtered export.
- **KYC/KYB with AiPrise**: risk segmentation, one verification per product,
  document requests between analyst and applicant, per-country thresholds.
- **Authentication**: password history and reuse blocking.
- **Workflow engine** in the suite: a fourteen-table schema, an execution engine,
  optimistic locking, and **fifty-one end-to-end tests** plus nineteen with real
  authentication.
- **Cross-border to Mexico** via Bridge API, with CLABE mapping.
- Mobile: **native WebView security module**, device de-authorisation.

## How money gets in — the rails, in order of arrival

Wompi (2022) · Kushki (2023) · Payphone, Transfiya, Iris, Epayco, Payoneer (2024)
· Banco Agrario, Fireblocks, PSE, Bre-B (2025) · Bridge API, Fogafín, AiPrise
(2026).

Twelve distinct integrations in four years. The lesson they leave is in the
log: the tenth provider should not cost what the first one did.
