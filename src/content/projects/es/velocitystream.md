---
name: velocitystream
lang: es
status: live
url: https://istemp.xyz
summary: Plataforma de video autohospedada con pipeline de transcodificación automática y puntaje de calidad por video, en producción detrás de su propio borde CDN.
stack: [Node, React, FFmpeg, HLS, BullMQ, Redis, Prisma, Docker]
stats:
  - { value: '627', label: 'archivos' }
  - { value: '134', label: 'tests' }
  - { value: '5', label: 'pipelines' }
order: 4
---

Subís cualquier cosa y sale HLS adaptativo. La transcodificación corre como
trabajo encolado y no en línea con el request, porque un trabajo de FFmpeg de
ocho minutos no va en una conexión donde alguien está esperando.

**La calidad se mide, no se supone.** Cada salida se puntúa con VMAF contra su
fuente. Apuntar a un puntaje en lugar de a un bitrate es lo que mantiene honesta
la escalera de calidades: un bitrate que se ve bien en una escena de entrevista
se desarma con grano y movimiento, y sin puntaje nadie lo nota hasta que lo nota
un espectador.

Los originales se borran una vez verificada la escalera, que es la diferencia
entre una factura de almacenamiento que crece con el catálogo y una que crece con
lo que la gente efectivamente mira.

**Sobre el stack, con honestidad:** es la pieza más vieja del ecosistema y está
en JavaScript, no en TypeScript. Los paquetes de capacidades en los que derivó
—tipados, con contratos, en `velocityanime`— existen porque operar esto me
enseñó dónde tenían que ir las costuras. La migración es la decisión de
arquitectura, no una deuda que esconda.
