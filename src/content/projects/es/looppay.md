---
name: LoopPay — plataforma de pagos
lang: es
status: closed
summary: 'Cuatro años en los sistemas que mueven dinero: dispersiones masivas y su reversión, integración de webhooks de proveedores, conciliación de saldos, límites de tasa y trazas de auditoría.'
stack: [TypeScript, GraphQL, Prisma, PostgreSQL, AWS Lambda, OpenTelemetry, React, React Native]
stats:
  - { value: '4', label: 'años' }
  - { value: '~40', label: 'ingenieros' }
  - { value: '12', label: 'rails integrados' }
order: 0
---

Dinero que entra, dinero que sale, y todo lo que tiene que aguantar cuando no
pasa a la primera. Trabajo a lo largo de todo el stack — React adelante, una API
de GraphQL y Prisma detrás, AWS Lambda desplegado con CDK, pipelines de CI y
suites end-to-end — dentro de un equipo de ingeniería de alrededor de cuarenta
personas.

Participé en cuatro productos de la misma familia: **la plataforma Loopay** —
base de las marcas blancas **Masari** y **SuperPay** —, **Bico**, un producto
paralelo, **la app móvil de Bico**, y **una suite nueva** con su propio backend.

## Línea de tiempo

Lo que sigue es lo que construí, por año, al nivel de módulo. El código es
privado; acá está la clase de problema y la decisión, nunca la implementación.

### 2022 — entrada por el backoffice

Tres meses, y ya estaba en la salida de dinero.

- **Gestión de documentos y KYC** en el backoffice: área de documentos, carga de
  KYC, alertas al re-subir.
- **Primer rail de pago: Wompi**, widget de cobro y su webhook.
- **Dispersión masiva**: una hoja de cálculo en el navegador que valida cada
  campo — beneficiario, documento, banco, tipo y número de cuenta, valor — y
  produce el lote de payouts como borrador; nada se ejecuta hasta que alguien lo
  aprueba. La construí de punta a punta.
- **Payouts v1**: validación de cuenta bancaria sobre el lote, tags en payouts
  individuales y masivos, alertas en rechazados.
- **Dispersiones programadas**: calendario y payouts diferidos, back y front.
- Motor de email con Mailjet; cuentas bancarias de Ecuador.

### 2023 — notificaciones, payin y webhooks como producto

El año en que la plataforma dejó de ser solo salida de dinero.

- **Motor de notificaciones**: email, notificación al usuario por payout, Twilio
  como canal de entrega; **migración de Mailjet a Sendinblue**.
- **Recarga (payin)**: nueva interfaz, y **Kushki** como segundo rail, integrado
  al módulo de recarga.
- **Payouts gestionados** con resumen previo a la aprobación; los administradores
  de empresa ven el saldo de sus clientes.
- **Fuentes de recaudo**: constructor de tres pasos para dar de alta y
  configurar una fuente de recaudo, con formato de moneda y validación de
  teléfono. El módulo de recarga nuevo se integró sobre él.
- **Webhooks como producto**: cada empresa registra su propia URL con secreto
  cifrado, el despacho se engancha en payin y payout, y un modelo de logs
  registra cada entrega. Cerró con un **webhook general con patrón de
  estrategias** — [la entrada de bitácora](/es/bitacora/webhook-strategy/)
  cuenta por qué.
- Ochenta y cuatro commits de tests ese año. Fue el año en que aprendí a no
  confiar en el camino feliz.

### 2024 — cross-border y compliance

- **Cross-border**: backoffice, transacciones, contactos, servicio de conversión
  de montos y **validación de pares de moneda** por país.
- **Tres rails nuevos**: Payphone, Transfiya (carga por Excel) y Epayco; plantillas
  de cashout para Payoneer.
- **Webhooks de ciclo de vida**: payout, expiración de cashin y cashout, Iris.
- **Beneficiarios** como entidad propia: alta, edición, validación de cuenta y
  tipo, y un modal de favoritos con filtro por tags para armar un lote sin
  volver a tipear a nadie.
- **Refactor del constructor de payouts**, con carga de archivo.
- **Compliance**: badges y mutación en backoffice, módulo de aprobación, firma de
  acuerdos legales, campos adicionales de onboarding.
- **Lista de bloqueo y motor validador de payouts**, integrado al servicio y a la
  dispersión masiva.
- Paginación, búsqueda y filtros en las tablas que más se usaban.

### 2025 — Bico como producto, y una app móvil desde cero

- **Bico**: fuentes de recaudo, self-payin, webhooks de payin externo y de estado
  de empresa, productos tipo **bolsillo**, registro propio, scaffolds de empresa
  y pestañas de documentos.
- **Iris** como método de recaudo, con su propio motor de cobro.
- **Fireblocks**: webhook de custodia cripto que crea el payin.
- **App móvil de Bico, desde cero**: fast checkout, bolsillos, **Banco Agrario**
  con cuentas y notas de crédito, **PSE**, transferencia rápida, extractos,
  dispositivo único de confianza, cierre de sesión por inactividad y por tiempo
  en segundo plano.
- **Suite nueva**: constructor de payouts en COP sobre **Bre-B**, el sistema de
  pagos inmediatos; módulos de bancos y tipos de documento; listados de payin y
  payout por empresa.
- API pública: rechazo automático de payouts como opción.

### 2026 — escala, reversiones y regulatorio

El año en que el trabajo se volvió de plataforma.

- **Cinco fases de rendimiento**: optimización de consultas, **paginación por
  cursor** en exportaciones, y **alarmas en CloudWatch con endpoint de salud**.
- **Dispersiones masivas a escala de toda la base de billeteras.**
- **Reembolsos masivos** con carga de archivo, y el **módulo completo de reversos
  masivos de payins**, con historial por lote y estado en tiempo real. La cola
  pasó de Redis a Postgres —
  [la entrada de bitácora](/es/bitacora/mass-reversal-queue/) explica por qué.
- **Captura manual** de dispersiones y reembolsos, con **aprobación obligatoria
  antes de que el dinero se mueva**.
- **Prevención de duplicados** en dispersiones, reembolsos y recaudos de origen
  institucional (Fogafín).
- **Billeteras con medidas judiciales**: guía de levantamiento, filtros y
  exportación.
- **Contabilidad**: reglas de entrada y salida, exportación con filtros.
- **KYC/KYB con AiPrise**: segmentación de riesgo, una verificación por producto,
  solicitud de documentos entre analista y solicitante, umbrales por país.
- **Autenticación**: historial de contraseñas y bloqueo de reúso.
- **Motor de workflows** en la suite: esquema de catorce tablas, motor de
  ejecución, bloqueo optimista, y **cincuenta y un tests end-to-end** más
  diecinueve con autenticación real.
- **Cross-border a México** vía Bridge API, con mapeo de CLABE.
- App móvil: **módulo nativo de seguridad para WebView**, desautorización de
  dispositivos.

## Cómo entra el dinero — los rails, en orden de llegada

Wompi (2022) · Kushki (2023) · Payphone, Transfiya, Iris, Epayco, Payoneer (2024)
· Banco Agrario, Fireblocks, PSE, Bre-B (2025) · Bridge API, Fogafín, AiPrise
(2026).

Doce integraciones distintas en cuatro años. La lección que dejan está en la
bitácora: el décimo proveedor no debería costar lo que costó el primero.
