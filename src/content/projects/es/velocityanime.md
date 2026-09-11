---
name: velocityanime
lang: es
status: live
url: https://velocityanime.com
summary: Producto de streaming single-tenant sobre capacidades core con contratos, en producción sobre mi propia infraestructura.
stack: [TypeScript, Fastify, Zod, Prisma, Docker, HLS]
stats:
  - { value: '291', label: 'archivos' }
  - { value: '72', label: 'tests' }
  - { value: '8', label: 'capacidades' }
order: 2
---

El producto importa únicamente el índice público de cada capacidad core
(`@velocity/core-*`); las subrutas internas están prohibidas por una regla de
ESLint, no por convención. Todas las dependencias se cablean en un solo
composition root y bajan como puertos.

La entrega es HLS con AES-128 y tickets de reproducción firmados. La ingesta es
solo de admin y los subtítulos vienen embebidos en la fuente.
