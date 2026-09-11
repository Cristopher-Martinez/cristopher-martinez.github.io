---
name: LoopPay — payments platform
lang: en
status: closed
summary: 'Four years on the systems that move money: bulk dispersals and their reversal, provider webhook integrations, balance reconciliation, rate limiting and audit trails.'
stack: [TypeScript, GraphQL, Prisma, PostgreSQL, AWS Lambda, OpenTelemetry, React]
stats:
  - { value: '4', label: 'years' }
  - { value: '~40', label: 'engineers' }
  - { value: '10k+', label: 'commits in the codebase' }
order: 0
---

Money in, money out, and everything that has to hold when it does not go through
the first time. I work across the stack — React on the front, a GraphQL and
Prisma API behind it, AWS Lambda deployed through CDK, CI pipelines and
end-to-end suites — inside an engineering group of roughly forty.

The problems that took most of my time are the unglamorous ones:

- **Bulk dispersals and their reversal.** Undoing a batch that touched the whole
  wallet base is not undoing many payments; it is one action that has to land
  everywhere or nowhere.
- **Provider webhook integrations.** Each provider arrives with its own payload
  shape and its own idea of what a retry means.
- **Balance reconciliation.** Which is only useful if a difference is a signal
  rather than rounding noise everyone has learned to tolerate.
- **Rate limiting and audit trails** that have to survive being questioned.

Observability is OpenTelemetry end to end, database spans included. Money
arithmetic is decimal-exact, never floating point.

Three entries in the engineering log come from this work. The code is private;
what is written here is the class of problem and the reasoning, never the
implementation.
