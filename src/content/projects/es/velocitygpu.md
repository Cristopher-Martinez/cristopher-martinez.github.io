---
name: velocitygpu
lang: es
status: closed
summary: Alquila una caja multi-GPU en Vast.ai y sirve un modelo de 32B con vLLM en tensor-parallel, desde una sola página.
stack: [Node, vLLM, Vast.ai, Electron]
stats:
  - { value: '32', label: 'archivos' }
  - { value: '0', label: 'dependencias' }
  - { value: '11', label: 'tests' }
order: 2
---

Un modelo de 32B no entra en una sola GPU: son unos 64 GB solo de pesos en FP16.
Por eso el provisioner busca una oferta con dos o más GPUs **en el mismo nodo**, y
vLLM reparte el modelo entre ellas por NVLink con `--tensor-parallel-size`.

Lo que más tiempo llevó no fue el camino feliz, sino el reconciler que cierra las
instancias huérfanas cuando un alquiler falla a mitad de camino — una caja de GPUs
que nadie apagó sigue facturando.

Corre sobre la biblioteca estándar de Node: cero dependencias de runtime.
