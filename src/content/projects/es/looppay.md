---
name: LoopPay — plataforma de pagos
lang: es
status: closed
summary: 'Cuatro años en los sistemas que mueven dinero: dispersiones masivas y su reversión, integración de webhooks de proveedores, conciliación de saldos, límites de tasa y trazas de auditoría.'
stack: [TypeScript, GraphQL, Prisma, PostgreSQL, AWS Lambda, OpenTelemetry, React]
stats:
  - { value: '4', label: 'años' }
  - { value: '~40', label: 'ingenieros' }
  - { value: '10k+', label: 'commits en la base' }
order: 0
---

Dinero que entra, dinero que sale, y todo lo que tiene que aguantar cuando no
pasa a la primera. Trabajo a lo largo de todo el stack — React adelante, una API
de GraphQL y Prisma detrás, AWS Lambda desplegado con CDK, pipelines de CI y
suites end-to-end — dentro de un equipo de ingeniería de alrededor de cuarenta
personas.

Los problemas que más tiempo me llevaron son los poco vistosos:

- **Dispersiones masivas y su reversión.** Deshacer un lote que tocó toda la
  base de billeteras no es deshacer muchos pagos: es una sola acción que tiene
  que caer en todos lados o en ninguno.
- **Integración de webhooks de proveedores.** Cada proveedor llega con su propia
  forma de payload y su propia idea de qué significa un reintento.
- **Conciliación de saldos.** Que solo sirve si una diferencia es una señal y no
  ruido de redondeo que todos aprendieron a tolerar.
- **Límites de tasa y trazas de auditoría** que tienen que sobrevivir a que
  alguien las cuestione.

La observabilidad es OpenTelemetry de punta a punta, con spans de base de datos
incluidos. La aritmética del dinero es decimal exacta, nunca punto flotante.

Tres entradas de la bitácora salen de este trabajo. El código es privado; lo que
está escrito acá es la clase de problema y el razonamiento, nunca la
implementación.
