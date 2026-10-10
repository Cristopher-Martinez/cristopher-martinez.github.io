---
name: velocityanime
lang: es
status: live
url: https://velocityanime.com
summary: Producto de streaming single-tenant sobre capacidades core con contratos que mantiene su catálogo al día, sin intervención.
stack: [TypeScript, Fastify, Zod, Prisma, Docker, HLS]
stats:
  - { value: '669', label: 'archivos' }
  - { value: '193', label: 'archivos de test' }
  - { value: '665', label: 'commits' }
order: 3
---

El producto importa únicamente el índice público de cada capacidad core
(`@velocity/core-*`), y todos los imports de `src` pasan por esos índices. La
regla de lint que prohíbe las subrutas internas está escrita pero todavía no corre
en CI, así que hoy el límite lo sostiene la revisión. La API cablea sus
dependencias en un solo composition root y las pasa como puertos; los workers
tienen sus propios puntos de entrada.

La entrega es HLS detrás de tickets de reproducción firmados, con URLs de
segmentos acotadas por un token HMAC. El cifrado AES-128 está integrado — viene de
velocitykeep a través del paquete core de entrega — pero está apagado en este
producto. La ingesta es solo de admin y los subtítulos vienen embebidos en la
fuente. El producto existe para demostrar estas habilidades; no es un servicio
comercial.

Buena parte de la ingeniería vive del lado del admin, en un pipeline que lleva un
episodio desde "existe en alguna parte" hasta "se reproduce, cifrado, en la
calidad correcta" sin que nadie lo toque. Lo que sigue es ese pipeline, módulo
por módulo. Las capturas salen del panel de administración en producción (la
interfaz está en español); los nombres de fuentes de terceros y las rutas
internas están difuminados. El código es privado — esto es el problema y la
decisión, no la implementación.

## Auto-ingesta programada: el sitio se mantiene al día solo

Un admin arma una lista de vigilancia de series en emisión. Un barrido corre con
un temporizador — cada 30 minutos por defecto — y, para cada serie, compara la
lista de episodios de la fuente con lo que el catálogo ya tiene. Solo se encolan
los episodios que faltan, por el mismo camino de ingesta que usaría una persona,
así que nada aguas abajo sabe ni le importa quién inició el trabajo.

![Panel de auto-ingesta: barrido activado, último barrido hace 17 minutos con una serie escaneada y nada nuevo, y la lista de vigilancia con un interruptor de descarga por serie.](../velocityanime/auto-ingest.png)

Lo que lo hace seguro para dejarlo solo:

- **Descarga opt-in por serie.** Con el interruptor apagado, el barrido igual
  cuenta los episodios pendientes para que el admin vea qué está esperando, pero
  no descarga nada.
- **Topes que fallan cerrados.** Tres episodios por serie, diez por barrido,
  cincuenta series por barrido y una pausa entre series (los valores por defecto,
  todos configurables). Los topes se aplican todo-o-nada por serie: un barrido
  nunca encola la mitad de un lote.
- **Sin barridos solapados.** Un tick que llega mientras el barrido anterior
  sigue corriendo se omite, pero igual refresca el heartbeat del worker: un
  barrido largo no debe parecer un worker muerto.
- **Un kill switch que se respeta a mitad de barrido.** Apagarlo desde la UI
  aborta la corrida entre dos series; no espera al próximo tick.
- **Deduplicación contra el conjunto completo de claves de job**, no contra las
  últimas 200 filas, para que un historial que crece no cause una re-descarga. El
  barrido además visita primero la serie revisada hace más tiempo.
- **Reporte tolerante a caídas.** Los resultados se persisten por serie, así que
  un crash pierde como máximo la serie que estaba en curso.

La auto-ingesta es uno de varios temporizadores del worker, junto con el
enriquecimiento de metadata y un barrido de reconciliación entre base de datos y
almacenamiento; la purga de media corre como su propia cola.

### Prueba de que corre sin supervisión

![Lista de trabajos de ingesta: ocho filas marcadas auto, un episodio por semana del 9 de agosto al 27 de septiembre, siete terminados y uno fallido con botón de reintento. La columna de fuente y el mensaje de error están difuminados.](../velocityanime/ingest-jobs.png)

La insignia **auto** solo aparece en los trabajos creados por el barrido, no por
una persona. Los episodios 8 al 14 llegaron con una semana de diferencia, entre
el 16 de agosto y el 27 de septiembre, y terminaron solos. El episodio 7 falló en
una lectura de almacenamiento y sigue en la lista con un botón de reintento en
lugar de desaparecer. Hoy la lista de vigilancia tiene una sola serie en emisión;
el barrido y sus topes están dimensionados para cincuenta.

## Descarga

Dos motores comparten una misma interfaz de descubrimiento.

**Cola de ingesta.** Una cola BullMQ con cinco intentos y un backoff propio. Los
mirrors limitan cada conexión, así que un archivo se baja por varias conexiones
con rangos a la vez (aria2c, con una descarga segmentada de respaldo) y el límite
deja de importar. El cuerpo de la respuesta se valida antes de contarlo como
video, de modo que una página de error HTML nunca se publica como episodio. Los
fallos se propagan a la cola a propósito, para que la política de reintentos viva
en un solo lugar.

**Descargar al PC.** Mismo descubrimiento, pero el episodio termina en el
navegador del admin como MP4 en vez de en el catálogo. Se deja en staging en el
servidor, se entrega por un enlace de un solo uso con vencimiento y se limpia con
un temporizador. No transcodifica ni ocupa almacenamiento del catálogo. Una
descarga a la vez, un tope de trabajos en cola, y cancelar mata de verdad el
proceso subyacente.

Las fuentes de contenido están detrás de un único puerto de proveedor — buscar,
info, descargar, resolver — con un router que elige por dominio y un canario de
salud que escoge el proveedor más sano por serie. Una fuente nueva es un adapter.

## Transcodificación

Un archivo fuente se convierte en HLS adaptativo con acceso por token. Los
workers pueden correr en una CPU o en una GPU alquilada, y un worker se suma a la
flota solo con una URL de API y una clave (las claves se guardan con hash y se
muestran una sola vez).

![Ajustes del transcoder: perfil de calidad por defecto (ligero, medio, alto, original), el modo ABR encadenado activado y overrides por serie.](../velocityanime/transcoder.png)

- **Perfiles de calidad.** Ligero es 480p, medio 720p, alto 1080p y original
  conserva la altura nativa. Con el modo encadenado (ABR) activado, un perfil
  produce una escalera de renditions para que el reproductor cambie según el ancho
  de banda. Una serie puede sobrescribir el perfil global.
- **Un job tiene que fallar fuerte.** Una guarda rechaza la salida que se
  decodifica como basura verde en lugar de publicarla, y un límite de tiempo duro
  mata una corrida de `ffmpeg` que se extiende demasiado — existe por un job que
  se quedó colgado catorce horas.
- **Estado idempotente.** El ID del job es el ID del media; la máquina de estados
  va de pendiente a procesando, listo o fallido, y de fallido de vuelta a
  procesando al reintentar. El callback del worker está firmado con HMAC y es
  idempotente. Esto cerró una carrera en la que dos workers podían tomar el mismo
  episodio y reportar un éxito falso.
- **Limpiadores que no pueden ser catastróficos.** La reconciliación de huérfanos
  tiene un tope de borrados por corrida, un período de gracia y una guarda que se
  niega a correr cuando los números se ven mal. El limpiador de huérfanos rescata
  los jobs activos y conserva su ID.
- Las miniaturas por escena y la extracción de subtítulos embebidos corren en el
  mismo pipeline.
- **Entrega.** Las rutas de los segmentos llevan un token HMAC acotado a un solo
  media; sin él, el proxy responde 403. El paquete core también puede entregar
  una clave AES-128 solo a un token firmado vigente, pero el cifrado está apagado
  en este producto.

## GPUs alquiladas y el autoscaler

Cuando la cola se acumula, la transcodificación puede pasar a una GPU alquilada
por hora.

![Panel de GPU alquilada: pool multi-GPU en 0 de 2, autoscaler activado con tres jobs por instancia, un máximo de dos instancias y un techo de gasto de 0,6 dólares por hora.](../velocityanime/gpu-autoscaler.png)

- **Tres modos.** Apagado, dry-run — que registra sus decisiones sin actuar — y
  encendido.
- **Límites duros, no buenas intenciones.** Jobs por instancia, un máximo de
  instancias y un techo por hora para toda la flota. Subir y bajar capacidad son
  funciones puras con histéresis, más apagado por inactividad, detección de
  zombis y un libro de costos.
- **Memoria de hosts malos.** Los hosts que no logran arrancar quedan vetados con
  un motivo; al momento de escribir esto la lista tenía 68 hosts, 57 por
  timeout de arranque y 7 por no tener codificador por hardware.
- **Estado honesto.** En la captura está inactivo: cola en cero, pool en 0 de 2,
  y el último scale-up fue unas diez semanas antes. El worker de CPU absorbe solo
  el volumen semanal; el pool de GPU es para cuando se acumula trabajo.

## Alrededor del pipeline

- **Aprobación.** Los episodios pasan por estados pendiente, aprobado y rechazado,
  con filtros por problema (falta título, falta miniatura) y atajos de teclado.
- **Metadata del catálogo.** Enriquecimiento con AniList, sinopsis traducidas con
  un LLM y un armador de grupos de series con veto cronológico.
- **Control de acceso.** JWT de Supabase verificados contra el JWKS del emisor
  (ES256) y una guarda de roles en cada ruta de admin.
- **Observabilidad y recuperación.** Métricas Prometheus desde el worker y la API,
  con labels de baja cardinalidad a propósito (sin IDs de usuario), un dump diario de la base con
  historial de solo lectura y un plan de recuperación ante desastres escrito.

**Sobre los números de arriba.** Contados en octubre de 2026 sobre la rama principal del repositorio de velocityanime, el que está en producción: archivos rastreados, archivos con nombre `*.test.*` o `*.spec.*`, y commits sin contar merges. El repositorio es privado.
