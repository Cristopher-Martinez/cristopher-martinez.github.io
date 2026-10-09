---
title: La escritura MCP que devolvía éxito y no guardaba nada
lang: es
date: 2026-06-14
summary: Lecturas y escrituras resolvían a dos stores físicos distintos. Toda escritura devolvía éxito, y los bytes caían donde nadie leía nunca.
outcome: La resolución de escritura ahora es simétrica con la de lectura, y las entradas ajenas sobreviven a una reescritura. La pérdida silenciosa de datos desapareció; la lección sobre confiar en los valores de retorno no.
project: project-brain
tags: [mcp, debugging, integridad]
---

## El problema

Las memorias escritas a través del servidor MCP devolvían `success`. No estaban
en el repositorio. Buscarlas no traía nada, y los archivos no estaban en el disco
donde se suponía que vivía el store.

Nada había lanzado excepción. Nada había registrado un aviso. La herramienta
hacía exactamente lo que se le pedía, informaba que había funcionado, y perdía
los datos.

## La restricción

El store se resuelve en tiempo de ejecución, no se configura: el servidor busca
un directorio de memoria versionado dentro del proyecto y cae a una caché privada
por servidor cuando no hay ninguno. Ese fallback es correcto — un servidor
arrancado fuera de todo proyecto igual tiene que funcionar.

## Lo que descarté

Mi primer instinto fue que la escritura fallaba en silencio y necesitaba mejor
manejo de errores. No estaba fallando. Estaba teniendo éxito, en la dirección
equivocada. Envolverla en más manejo de errores habría producido el mismo
comportamiento incorrecto, con más logs alrededor.

## La decisión

El camino de lectura resolvía dando prioridad al proyecto; el de escritura
siempre devolvía el almacenamiento local. Dos resolvedores, uno asimétrico. El
arreglo fue que la resolución de escritura reflejara la de lectura, en vez de
agregar una verificación por encima — un invariante que se cumple por
construcción le gana a uno que alguien tiene que acordarse de revisar.

Salió un segundo bug, más callado, junto con el primero: reescribir el archivo de
opiniones descartaba entradas que no había escrito él mismo. Ahora se preservan.

## Lo que me sorprendió

Cuánto tiempo estuvo escondido. Una herramienta de escritura que devuelve
`success` se cree, así que nadie va a mirar. La falla solo era visible revisando
el sistema de archivos en busca de bytes que deberían haber estado ahí — algo que
no se hace salvo que ya se sospeche que el valor de retorno está mintiendo.

La forma general del asunto: **un valor de retorno es una afirmación sobre lo que
pasó, y una afirmación no es evidencia.** Donde la escritura importa, verifica
que llegó.
