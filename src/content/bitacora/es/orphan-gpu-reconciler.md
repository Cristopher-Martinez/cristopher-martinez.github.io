---
title: El alquiler de GPU que siguió facturando tras fallar el despliegue
lang: es
date: 2026-06-14
summary: Un aprovisionamiento a medias dejó una caja de Vast.ai corriendo sin que nadie la siguiera. El arreglo no fue mejor manejo de errores, sino volver reconciliable el estado del alquiler.
outcome: Las instancias huérfanas se cierran en una pasada de reconciliación. Desde entonces ninguna caja sobrevivió a su sesión.
project: velocitygpu
tags: [infra, gpu, fiabilidad]
---

## El problema

Alquilar una caja de GPU no es una operación, son cuatro: consultar ofertas,
crear la instancia, esperar a que levante el contenedor y sondear vLLM hasta que
responda. Un fallo en el paso tres deja una máquina corriendo y facturando, con
el proceso que la creó ya muerto.

## La restricción

Vast.ai factura por segundo y no hay ningún servidor mío que recuerde qué
arranqué. El único registro durable de «esta caja es mía» vivía en un proceso
local que acababa de caerse.

## Lo que descarté

Un `try/finally` alrededor del aprovisionamiento era el primer movimiento obvio,
y no alcanza: solo cubre los fallos que el proceso sobrevive. Matá el proceso,
cortá la luz, cerrá la notebook — la caja sigue corriendo.

## La decisión

Tratar el alquiler como estado reconciliable y no como una transacción. El store
registra la intención **antes** de la llamada a la API, y una pasada de
reconciliación compara los alquileres que pretendía tener contra lo que Vast.ai
efectivamente reporta, cerrando todo lo que existe remotamente pero no localmente.

Eso invierte la pregunta: de «¿corrió mi código de limpieza?» a «¿el mundo
coincide con lo que pretendía?». La segunda sobrevive a un proceso que nunca
llegó a ejecutar una sola línea.

## Lo que me sorprendió

El reconciler encontró huérfanas de corridas que ya había olvidado. El bug venía
costando plata en silencio desde antes de que la funcionalidad existiera.
