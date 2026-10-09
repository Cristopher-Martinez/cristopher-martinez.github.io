---
title: 'Cuando nadie aprieta Alquilar: dejar que una cola compre GPUs'
lang: es
date: 2026-07-30
summary: En velocitygpu una persona alquila una GPU. En velocitykeep lo hace la cola de transcodificación, y eso traslada los problemas difíciles del aprovisionamiento al gasto, la confianza y la limpieza.
outcome: La transcodificación escala hacia GPUs alquiladas cuando se acumula trabajo y vuelve a cero cuando la cola se vacía. El gasto queda acotado por un tope de flota por hora, un plazo de arranque y un reaper de zombis, y las máquinas alquiladas solo tienen credenciales de vida corta.
project: velocitykeep
tags: [infra, gpu, autoscaling, security]
---

## De dónde sale

[velocitygpu](/es/bitacora/orphan-gpu-reconciler/) existe porque quería correr
modelos que mi laptop no aguanta: una persona elige un modelo, alquila una caja y
la usa. La misma necesidad aparece en video. La transcodificación y el
posprocesamiento son pesados e intermitentes, y una GPU solo se paga sola mientras
hay trabajo para ella.

[velocitykeep](https://velocitykeep.com) es la plataforma de video autoalojada que
opero en producción, llamada velocitystream hasta hace poco. Su código de alquiler
viene del mismo linaje que velocitygpu: un cliente de Vast.ai, ofertas ordenadas
y memoria de los hosts que fallaron. Se portó en lugar de compartirse, y tuvo que
crecer, porque aquí nadie está mirando un panel.

## El problema

Cuando el disparador es una persona, un error cuesta una caja. Cuando el
disparador es una cola, un error cuesta una flota. Aparecen tres modos de falla que
antes absorbía la persona en el circuito: gasto descontrolado, máquinas que parecen
vivas y no hacen nada, y máquinas que no controlo ejecutando mi carga.

## La restricción

La máquina alquilada es de un desconocido. Necesita el acceso justo para hacer el
trabajo y no más. Y los almacenes de datos de la plataforma viven en mi propio
servidor, que no debe abrirse a internet solo porque un worker los necesite.

## Lo que descarté

**Exponer Redis y Postgres a los workers.** Es el camino más corto, y el que
convierte una máquina alquilada en una puerta.

## La decisión

La cola decide, dentro de límites. Cada minuto el autoescalador compara el pendiente
con lo que la flota actual puede procesar y alquila la diferencia, sujeto a un
enfriamiento y a un tope del gasto total por hora de la flota. Las ofertas se
puntúan antes de alquilar: solo clases de GPU capaces de ejecutar el codificador por
hardware, por encima de un mínimo de driver.

La máquina se trata como no confiable. Recibe una configuración reducida, que baja
al arrancar con una clave de vida corta marcada como remota, y llega a la cola y a
la base de datos por un túnel hacia mi servidor en lugar de puertos expuestos.

La caja es solo otro consumidor de la cola existente. Ejecuta el mismo worker en un
modo GPU y toma únicamente los trabajos de transcodificación: miniaturas, huella de
audio, una pasada previa que busca el ajuste de calidad, la escalera codificada por
hardware, la verificación de calidad, el cifrado y la subida. Escribe un latido para
que la plataforma distinga una máquina que trabaja de una que calla. No hay un
segundo pipeline que mantener.

La limpieza tiene un único camino: destruir primero en el proveedor, después borrar
el registro local y anotar el costo en un libro de gastos. Una máquina que no se
reporta en doce minutos se da por perdida. La que deja de enviar latidos se destruye
y su host se veta. Una flota ociosa se apaga cuando el pendiente se mantiene en
cero, y un reconciliador poda las instancias que el proveedor ya no tiene.

## Lo que me sorprendió

Una caja alquilada puede arrancar, pasar su verificación de salud y aun así no
poder codificar. Una semana después de la primera versión hubo que actualizar el
toolchain de GPU de la imagen para que las máquinas alquiladas pudieran usar el
codificador por hardware. Hoy el script de arranque corre una prueba de codificación
antes de que la caja tome trabajo, y las ofertas se filtran por clase de GPU y
driver.

## Lo que le diría a quien lo haga después

Pasar la decisión de una persona a una cola no elimina el criterio de la persona.
Lo traslada a límites: un tope de gasto, un plazo, un latido, un interruptor de
apagado. Conviene escribirlos antes del autoescalador y no después de la primera
factura.

La versión pequeña de esta idea, y la falla que tuvo que sobrevivir, está en
[la entrada de velocitygpu](/es/bitacora/orphan-gpu-reconciler/). El producto que
ejecuta esta es [velocitykeep](/es/work/velocitykeep/).
