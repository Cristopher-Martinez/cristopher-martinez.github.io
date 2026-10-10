---
title: Correr modelos que mi laptop no aguanta sin pagar una GPU olvidada
lang: es
date: 2026-06-19
summary: Alquilo GPUs por hora para correr modelos abiertos que mi laptop no aguanta. El riesgo es la caja que sigue facturando cuando muere el proceso que la alquiló. El arreglo fue hacer el estado reconciliable.
outcome: Tras un reinicio el panel vuelve a mostrar la instancia que seguía viva, con su tiempo real de uso y un botón de destruir que funciona, en lugar de un fantasma que factura sin que nadie lo vea. La readopción cubre una instancia a la vez, que es todo lo que la app alquila.
project: velocitygpu
tags: [infra, gpu, confiabilidad]
---

## De dónde sale

Un modelo de 14B a 32B no entra en mi laptop, y yo quería correrlos igual.
Alquilar una GPU por hora es barato, así que
[velocitygpu](https://github.com/Cristopher-Martinez/velocitygpu) automatiza todo
el flujo de «necesito una GPU más grande por una hora»: encontrar una máquina,
arrancar Ollama en ella, descargar el modelo, esperar a que esté de verdad
residente en VRAM y conversar con él desde una sola página.

Hacerlo a mano falla de formas aburridas. Las ofertas desaparecen entre la
búsqueda y el alquiler, algunos hosts se caen al arrancar, una descarga de varios
gigas tarda minutos y una instancia olvidada sigue facturando. Esta entrada trata
de la última.

## El problema

Alquilar no es una operación. Son cinco: buscar ofertas, crear la instancia,
esperar a que el contenedor responda, descargar el modelo y esperar a que esté
caliente en VRAM. El estado del alquiler vive solo en la memoria del servidor. Si
el proceso se reinicia, por una caída, por un despliegue o porque el puerto
estaba ocupado, pierde el rastro de una máquina que sigue corriendo y sigue
facturando.

## La restricción

No hay otro servidor mío que recuerde lo que arranqué. El único registro durable
de que una caja es mía está del lado del proveedor, y en un proceso que quizá
acaba de morir.

## Lo que descarté

**Limpiar en un bloque `finally`.** Es el primer movimiento obvio, y el script de
punta a punta lo usa, con manejadores de señales encima. Pero solo cubre las
fallas que el proceso sobrevive. Matarlo, perder la luz, cerrar la laptop: la caja
sigue corriendo. Incluso ahí el README indica confirmar en la consola de todas
formas.

**vLLM repartido en varias GPUs.** El primer commit de la prueba de concepto, el 18
de junio en mi monorepo privado, alquilaba una caja multi-GPU y servía el modelo con
vLLM. (El repositorio público se publicó con un historial nuevo en octubre de
2026.) Al día
siguiente ya era Ollama en una sola GPU. El código guarda las razones en sus
comentarios: con Ollama la máquina arranca vacía y el modelo se descarga después,
así que una sola imagen sirve cualquier modelo, y pedir más GPUs de las que usa el
modelo significa pagar tarjetas ociosas y, en algunos hosts, un error de
dispositivo del contenedor.

## La decisión

Tratar la cuenta del proveedor como fuente de verdad y preguntarle al arrancar. El
reconciliador lista las instancias vivas y reconoce las propias por la imagen
oficial de Ollama. Es una heurística, no una verificación de propiedad: otra caja
con Ollama en la misma cuenta también coincidiría, algo aceptable para una
herramienta de un solo usuario. Toma la que arrancó más recientemente y reconstruye el estado: el
host físico, el tiempo real de uso desde el inicio del contrato y el modelo, que
lee de la propia lista de modelos descargados de Ollama. Después sondea el
endpoint para ubicar la caja en la fase correcta. El panel vuelve a mostrar la
instancia y el botón de destruir funciona.

Toda la lógica de decisión son funciones puras con tests. Las pocas llamadas de red
quedan en los bordes, y cualquier falla en ellas se absorbe para que una mala
conexión nunca impida que el servidor arranque. Corre únicamente cuando el almacén está en reposo, así que
nunca pisa un alquiler que ya está registrado.

Eso cambia la pregunta de «¿corrió mi código de limpieza?» a «¿el mundo coincide
con lo que creo que poseo?». La segunda sobrevive a un proceso que nunca llegó a
ejecutar código.

## Lo que me sorprendió

Justo después de crearla, el proveedor devuelve un estado real vacío aunque la
máquina ya esté corriendo. Juzgar si está viva por un solo campo habría tratado
las cajas recién creadas como muertas, así que la verificación acepta cualquiera
de tres señales.

## Lo que sigue abierto

Un alquiler a la vez, sin apagado por inactividad y sin autenticación en el
servidor de la app. El README la presenta como prueba de concepto en sus primeras
líneas y enumera estos límites en su propia sección.

## Adónde fue después

El mismo enfoque de alquiler ahora ejecuta la transcodificación de video en
[velocitykeep](/es/work/velocitykeep/), con una diferencia que lo cambia todo: lo
dispara una cola en lugar de una persona.
[Esa entrada](/es/bitacora/gpu-autoscaler-for-transcoding/) cuenta los modos de
falla que aparecen cuando nadie está mirando.
