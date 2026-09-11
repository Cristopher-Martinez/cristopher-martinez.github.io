---
name: project-brain
lang: es
status: closed
summary: Servidor MCP y extensión de VS Code que le da a los agentes de código memoria durable y consultable de un repositorio — recuperación híbrida sobre índice local, sin necesidad de API key.
stack: [TypeScript, MCP, RAG, Búsqueda híbrida, SQLite, VS Code API]
stats:
  - { value: '25', label: 'tools MCP' }
  - { value: '181', label: 'tests' }
  - { value: '839', label: 'commits' }
order: 1
---

Los agentes de código olvidan todo entre sesiones. project-brain les da una
memoria con alcance de proyecto que pueden consultar: notas de arquitectura,
fixes pasados, convenciones y las relaciones entre ellas, expuestas sobre el
Model Context Protocol como veinticinco herramientas.

**La recuperación es híbrida, no solo búsqueda vectorial.** Cada resultado
puntúa similitud coseno contra el embedding de la consulta y coincidencia por
palabra clave, mezcladas con un peso configurable que por defecto da 0,7 al lado
semántico, y después pasa por una etapa de reranking que aplica boosts por
contexto antes del corte top-k. La búsqueda puramente vectorial se pierde los
identificadores exactos: el nombre de una función es un problema de keyword, no
de semántica.

**El chunking depende del contenido.** La prosa corta en 1200 caracteres con 150
de solapamiento; el código corta en 1600 con 300. El código necesita la ventana
más grande porque una función truncada a mitad del cuerpo se recupera como ruido,
y necesita más solapamiento para que la firma y el cuerpo puedan caer en el mismo
fragmento.

**Los embeddings degradan con gracia.** Los proveedores viven detrás de un
registro de estrategias que resuelve por orden: un servidor remoto de embeddings
si hay uno configurado, y una implementación local de TF-IDF que está siempre
disponible. La consecuencia es que funciona sin API key y sin red — peor
recuperación, pero nunca una falla dura.
