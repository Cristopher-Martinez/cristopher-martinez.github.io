---
title: Una conciliación que dio dos centavos de diferencia
lang: es
date: 2023-01-20
summary: Dos centavos es poco para frenar algo y suficiente para probar que el sistema está mal. El monto nunca fue el problema — el problema es lo que te cuesta después haberlo tolerado.
outcome: La aritmética del dinero pasó a operaciones decimales exactas. Una diferencia en una conciliación vuelve a ser una señal, en vez de ruido que todos aprenden a ignorar.
project: LoopPay
tags: [pagos, correctitud, decimales]
---

## El problema

Una conciliación no cerraba. La diferencia era de dos centavos.

Dos centavos es el peor monto posible para estar equivocado. Es muy poco para
justificar frenar algo, y demasiado para ser nada. La tentación es redondearlo y
seguir, y ese movimiento es exactamente como una organización termina sin poder
distinguir un artefacto de redondeo de plata que realmente se perdió.

## La restricción

Esto no es un bug en el sentido habitual. Nada lanzó excepción, ningún test
falló, ninguna rama estaba obviamente mal. El punto flotante binario simplemente
no puede representar la mayoría de las fracciones decimales de forma exacta — la
demostración canónica es que sumar un décimo con dos décimos no da tres décimos.

Por operación el error está muy por debajo de un centavo y es invisible. A lo
largo de un lote se acumula, y se acumula *distinto* según el orden en que las
operaciones hayan corrido. Eso último es lo que lo vuelve miserable de
perseguir: ejecuta la misma conciliación dos veces sobre los mismos datos en otro
orden y es posible obtener otra discrepancia.

## Lo que descarté

**Redondear al final.** Hace que esta conciliación cierre y le enseña al sistema
a mentir en voz baja. La diferencia siguiente también se redondea, incluida la
que era real.

**Un umbral de tolerancia.** «Diferencias menores a cinco centavos son
aceptables» suena pragmático y es la misma decisión de traje — dejaste escrito
el tamaño de la mentira que vas a aceptar, y desde entonces no se puede detectar
nada más chico que eso.

## La decisión

Dejar de hacer aritmética de dinero en punto flotante. Las operaciones sobre
montos pasan por aritmética decimal exacta, así el resultado de una suma es el
resultado, no la aproximación representable más cercana.

Es menos cómodo. Cada suma es una llamada a función en vez de un operador, y el
código se lee peor. Ese es todo el costo, y compra la capacidad de tratar una
diferencia distinta de cero como información.

## Lo que le diría a quien lo haga después

El instinto es tratarlo como un problema de precisión y pedir más decimales. No
lo es. Es un problema de **representación**, y más precisión solo corre el error
más abajo, donde tarda más en notarse.

Y el daño real nunca son los dos centavos. Es que una vez que a un sistema se le
permite estar un poquito equivocado con el dinero, nadie puede usarlo para
responder la pregunta para la que existe.
