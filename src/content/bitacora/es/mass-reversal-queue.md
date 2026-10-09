---
title: Mover una cola de reversiones a la base que guarda el dinero
lang: es
date: 2026-08-05
summary: Deshacer una dispersión masiva significa escribir en cada billetera que tocó. Una sola transacción no aguanta eso, y una cola que vive fuera del libro contable puede terminar contradiciéndolo.
outcome: La cola y el libro contable comitean juntos, así que una falla a mitad de lote ya no puede dejar el trabajo pendiente y los saldos describiendo realidades distintas. Recuperarse es leer estado, no conciliar dos fuentes.
project: Loopay
tags: [pagos, postgres, colas, integridad]
---

## El problema

Una dispersión masiva acredita un lote de billeteras en una sola operación — un
bono, un subsidio, una corrección. A veces hay que deshacerla.

Revertirla no es lo mismo que revertir muchos pagos. Es una sola acción de
negocio que tiene que caer en todas las cuentas que la dispersión tocó, y
terminar con todas en el mismo estado. **Media reversión es peor que ninguna**:
ahora nadie sabe qué billeteras están bien.

## La restricción

El lote alcanza toda la base de billeteras — cientos de miles de cuentas en una
sola operación.

Ese número es lo que vuelve difícil el problema, y no es una cuestión de
rendimiento. Un solo `updateMany`, o una transacción envolviendo la reversión
entera, no se pone lento a esa escala. **Choca contra un techo y falla.** Hay un
límite físico a cuánto trabajo aguanta una transacción, y un lote de esa forma
está del lado equivocado. La implementación obvia no iba a ser lenta. Iba a ser
imposible.

## Lo que descarté

**Recorrer y revertir pago por pago.** Inviable a nivel operativo con ese
volumen, y tiene el peor modo de falla de los tres: se cae a mitad de camino sin
registro de dónde, y deja el lote partido entre revertido y no revertido.

**Una transacción grande.** El mismo muro, alcanzado más rápido, con el agregado
de que la base se pasa un buen rato reteniendo bloqueos antes de rendirse.

## La decisión

Separar el trabajo en lotes encolados, para que ninguna unidad de trabajo sea lo
bastante grande como para chocar contra el techo — y después mover la cola misma
de Redis a Postgres, al lado del dinero.

Esa segunda parte es la que vale la pena explicar. Con la cola en Redis y los
saldos en Postgres, encolar el trabajo y aplicarlo son dos escrituras a dos
sistemas, y **nada obliga a que coincidan**. Un corte entre ambas deja trabajo
pendiente que ya se aplicó, o trabajo aplicado que sigue encolado. Las dos
situaciones están mal, y después de una falla parcial no se puede distinguir cuál
pasó sin reconstruirlo a mano.

Poner la cola en la misma base hace que encolar y aplicar compartan transacción.
Comitean juntos o no comitea ninguno. El modo de falla no se maneja mejor: deja
de existir.

## Lo que le diría a quien lo haga después

El instinto es ir por la cola rápida, porque una cola es infraestructura y la
infraestructura tiene que ser rápida. Pero una cola que mueve dinero no es
infraestructura — es parte del libro contable. Va donde está el libro, y pagar
eso en latencia sale más barato que pagarlo en una conciliación que nadie puede
automatizar.
