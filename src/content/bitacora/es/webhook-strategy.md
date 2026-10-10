---
title: Cada proveedor nuevo costaba lo mismo que el primero
lang: es
date: 2024-01-02
summary: Cada integración llegaba con su propio webhook y recibía su propia implementación. El arreglo no fue un pipeline más rápido, sino separar lo que todos los proveedores comparten de la parte chica donde difieren.
outcome: Sumar un proveedor dejó de ser un proyecto y pasó a ser implementar una estrategia contra un contrato definido. El camino compartido —recibir, registrar, despachar— se escribe una vez y toda integración lo hereda.
project: Loopay
tags: [pagos, webhooks, arquitectura, integración]
---

*Escrita en 2026, sobre trabajo de enero de 2024.*

## El problema

La primera integración con un proveedor tenía su webhook. La segunda también.
Cada una escrita desde cero: recibir la llamada, descifrar qué significa el
payload, convertirlo en algo que la plataforma entienda, y actuar en
consecuencia.

Con una está bien. Con dos es una casualidad. Para la tercera ya es un patrón
que nadie nombró todavía, y **la décima integración cuesta exactamente lo que
costó la primera** — que es la definición de algo que no escala.

Ojo con esto: no era un problema de throughput. Nada se caía bajo carga. Lo que
no escalaba era el costo de decirle que sí a la integración siguiente.

## La restricción

Los proveedores no se ponen de acuerdo en nada. La forma del payload, qué campo
lleva el estado, cómo se ve un reintento, qué esperan en la respuesta — todo
difiere, y nada de eso se negocia desde nuestro lado. A un tercero no se lo
normaliza con ganas.

El mismo problema existía apuntando hacia afuera: las empresas de la plataforma
querían recibir notificaciones en sus propios endpoints. Misma forma, flechas al
revés.

## Lo que descarté

**Un handler único con una rama por proveedor.** Es el movimiento obvio y
funciona con dos. Para el cuarto es una función que nadie se ofrece a abrir,
donde cada cambio toca todas las integraciones y el radio de daño de un error
son todas juntas.

## La decisión

Separar lo que todos los proveedores comparten de la parte chica donde difieren.

Recibir, registrar la entrega y despachar hacia el dominio es el mismo trabajo
siempre, así que se escribe una vez. Interpretar el payload de un proveedor es
la única pieza genuinamente propia de cada uno, así que vive detrás de una
estrategia con un contrato definido.

Sumar una integración pasó a ser implementar ese contrato, no construir un
segundo pipeline al lado del primero.

## Lo que le diría a quien lo haga después

La trampa es ir por la abstracción en la integración dos, cuando todavía no hay
evidencia suficiente sobre qué partes varían de verdad — y se termina con un
contrato con la forma de una casualidad.

Dos es casualidad. En tres se ve la forma. Esperar hasta ahí se siente como
acumular deuda, y sale más barato que abstraer el eje equivocado y después tener
que deshacerlo en todas las integraciones que ya tenías.
