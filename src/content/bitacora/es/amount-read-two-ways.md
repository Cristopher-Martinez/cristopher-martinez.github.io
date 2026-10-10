---
title: Un monto que podía leerse de dos maneras
lang: es
date: 2023-01-20
summary: En una dispersión masiva armada desde una planilla, 1.000 puede ser mil o uno. El arreglo no fue un parser más listo, sino negarse a adivinar.
outcome: Los puntos y las comas solo se aceptan como separador decimal. Un monto que rompe la regla se rechaza en su fila y columna exactas antes de armar el lote, en lugar de leerse de una forma y pagarse de otra.
project: Loopay
tags: [pagos, corrección, validación]
---

*Escrita en 2026, sobre trabajo de enero de 2023.*

## El problema

El armador de dispersiones masivas es una planilla en el navegador: una fila por
beneficiario, una columna para el monto. La gente pega esos montos desde sus
propios archivos, y sus archivos no coinciden en qué significa un punto. En una
convención `1.000,50` es mil; en la otra, lo es `1,000.50`.

Leído con la convención equivocada, un monto se desvía por un factor de mil. En
un lote de payouts el monto no es un valor para mostrar. Es el dinero que sale.

## La restricción

El armador no puede saber qué convención usó cada persona. La celda guarda un
texto, y las dos lecturas son números válidos. Cualquier parser que deduzca la
"correcta" está adivinando, y una adivinanza sobre un monto es una decisión que
nadie aprobó.

## La decisión

Negarse a adivinar. En una celda de monto, un punto o una coma solo se aceptan
como separador decimal. Un valor que usa uno para agrupar miles se rechaza con un
mensaje que dice exactamente eso, y señala la fila y la columna donde está. Una
coma usada como separador decimal se normaliza a punto antes de calcular los
totales del lote.

A la persona le cuesta volver a escribir una celda. Nada se arma a partir de un
monto que el armador tuvo que interpretar.

## Lo que le diría a quien haga esto después

Cuando una entrada puede leerse de dos maneras, el parser más seguro es el que se
niega. Un error que nombra la celda es barato. Un beneficiario al que se le paga
mil veces de más, o de menos, no lo es — y el lugar para frenarlo es donde se
escribe el número, no donde se lo nota después.
