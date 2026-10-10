---
name: velocitykeep
lang: es
status: live
url: https://velocitykeep.com
summary: Plataforma de video autoalojada con transcodificación HLS en cola sobre GPUs alquiladas a demanda, calidad dirigida por VMAF y cuentas de invitado. En producción, antes velocitystream.
stack: [Node, React, FFmpeg, HLS, BullMQ, Redis, Prisma, PostgreSQL, Docker]
stats:
  - { value: '2.280', label: 'archivos' }
  - { value: '633', label: 'archivos de test' }
  - { value: '11', label: 'jobs de despliegue' }
order: 4
---

Se sube cualquier cosa y sale HLS adaptativo. La transcodificación corre como
trabajo encolado y no en línea con la petición, porque una transcodificación no
va en una conexión donde alguien está esperando. La entrega es HLS adaptativo
con cifrado AES-128.

**La calidad se dirige, no se supone.** Para videos más largos, una pasada previa
busca por bisección el ajuste de calidad del codificador hasta quedar cerca de un
puntaje VMAF objetivo, y después la mejor versión se puntúa contra el original.
Las demás versiones se marcan como estimadas en lugar de presentarse como
medidas.

**El posprocesamiento corre en GPUs alquiladas a demanda.** Cuando crece la cola
de transcodificación, un autoescalador alquila máquinas de Vast.ai. Cada una
ejecuta el mismo worker contra la misma cola y hace las miniaturas, la huella de
audio, la escalera de calidades codificada por hardware, la verificación de
calidad, el cifrado y la subida, y las cajas se destruyen cuando se acaba el
trabajo. Es el mismo enfoque de alquiler que
[velocitygpu](/es/work/velocitygpu/), portado y no compartido: allí una persona
alquila una caja, aquí lo hace la cola.
[La entrada de bitácora](/es/bitacora/gpu-autoscaler-for-transcoding/) cuenta qué
cambia cuando no hay una persona en el circuito.

**Sobre el stack, con honestidad:** es la pieza más vieja del ecosistema y está en
JavaScript, no en TypeScript. Los paquetes de capacidades con tipos y contratos de
[velocityanime](/es/work/velocityanime/) existen porque operar esto me enseñó
dónde tenían que ir las costuras. La migración es la decisión de arquitectura, no
una deuda que esconda.

**Sobre los números de arriba.** Contados en octubre de 2026 sobre la rama principal del repositorio de velocitykeep: archivos rastreados, archivos con nombre `*.test.*` o `*.spec.*`, y los jobs de su workflow de despliegue. El repositorio es privado.
