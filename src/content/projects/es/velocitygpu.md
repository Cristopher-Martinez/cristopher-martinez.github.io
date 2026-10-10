---
name: velocitygpu
lang: es
status: open
repo: https://github.com/Cristopher-Martinez/velocitygpu
summary: Alquila una GPU en Vast.ai, sirve un modelo abierto con Ollama y conversa con él desde una sola página. Nació para correr modelos que mi propia máquina no aguanta.
stack: [Node, Ollama, Vast.ai, Electron]
stats:
  - { value: '36', label: 'archivos' }
  - { value: '0', label: 'dependencias de runtime' }
  - { value: '257', label: 'tests' }
order: 2
---

Un modelo de 14B a 32B no entra en una laptop, y yo quería correrlos igual.
Alquilar una GPU por hora es barato. Hacerlo a mano no: las ofertas desaparecen
entre la búsqueda y el alquiler, algunos hosts se caen al arrancar, una descarga
de varios gigas tarda minutos y una instancia olvidada sigue facturando.
velocitygpu es el pegamento que se hace cargo de esos modos de falla: elegir un
modelo, alquilar, ver el despliegue en vivo y conversar.

Busca en Vast.ai una máquina que le quede al modelo, ordena las ofertas
(descartando hosts que ya fallaron y prefiriendo los que funcionaron), arranca
la imagen oficial de Ollama, descarga el modelo y espera a que esté de verdad
residente en VRAM antes de dar el estado por listo.

Lo difícil no fue el camino feliz, sino mantener honesto el alquiler cuando algo
se muere a mitad de camino. El estado vive solo en memoria, así que al arrancar
un reconciliador le pregunta a Vast qué sigue corriendo, readopta la caja con su
tiempo real de uso y recupera qué modelo sirve.
[La entrada de bitácora](/es/bitacora/orphan-gpu-reconciler/) cuenta esa
historia.

El mismo enfoque de alquiler ahora ejecuta la transcodificación de video en
[velocitykeep](/es/work/velocitykeep/), disparado por una cola en lugar de una
persona.

Los límites, sin maquillaje: es una prueba de concepto. Un alquiler a la vez,
sin autenticación en el servidor de la app y sin apagado por inactividad. El
README la presenta como prueba de concepto en sus primeras líneas y enumera estos
límites en su propia sección.

**Sobre los números de arriba.** Contados sobre la rama principal del repositorio público: archivos rastreados, dependencias de runtime en `package.json`, y los casos de test que reporta la suite al ejecutarse.
