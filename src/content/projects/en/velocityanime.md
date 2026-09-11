---
name: velocityanime
lang: en
status: live
url: https://velocityanime.com
summary: Single-tenant streaming product built on contract-bound core capabilities, running in production on my own infrastructure.
stack: [TypeScript, Fastify, Zod, Prisma, Docker, HLS]
stats:
  - { value: '291', label: 'files' }
  - { value: '72', label: 'tests' }
  - { value: '8', label: 'capabilities' }
order: 3
---

The product imports only the public index of each core capability
(`@velocity/core-*`); internal subpaths are forbidden by an ESLint rule rather
than by convention. Every dependency is wired in one composition root and passed
down as ports.

Delivery is HLS with AES-128 and signed playback tickets. Ingest is admin-only,
subtitles ship embedded in the source.
