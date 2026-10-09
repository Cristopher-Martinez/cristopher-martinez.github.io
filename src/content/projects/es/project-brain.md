---
name: project-brain
lang: es
status: open
repo: https://github.com/Cristopher-Martinez/project-brain-vscode
summary: Extensión de VS Code y servidor MCP que le da a los agentes de código una memoria permanente de un repositorio, que crece con él, para que gasten menos tokens. Hecho entre febrero y junio de 2026 y conservado como instantánea de referencia.
stack: [TypeScript, MCP, RAG, Búsqueda híbrida, SQLite, VS Code API]
stats:
  - { value: '25', label: 'tools MCP' }
  - { value: '181', label: 'tests' }
  - { value: '839', label: 'commits, historial privado' }
order: 1
---

**Por qué existe.** Quería gastar menos tokens en VS Code. Los agentes de código
olvidan todo entre sesiones y redescubren el mismo proyecto cada vez, así que
project-brain les da una memoria permanente que crece con el código: los propios
documentos del proyecto, indexados como vectores y embeddings, que el agente
consulta en lugar de releerlo todo. El 12 de febrero la economía de tokens ya
estaba escrita como principio de diseño, y cada skill aprendido debía ahorrar
tokens en la tarea siguiente.

**Hecho temprano, y se nota.** El primer commit es del 1 de febrero de 2026, unos
dos meses después de que VS Code lanzara los
[Agent Skills](https://code.visualstudio.com/updates/v1_107) como función
experimental. Febrero es memoria, vectores y economía de tokens, junto con los
primeros hooks. Marzo lo dominan los hooks, las puertas de validación y la
orquestación con loops y enjambres: los arneses alrededor de las iteraciones de los
agentes, para atrapar errores y mantenerlos en el camino previsto. El 31 de mayo
llega un motor portable de puertas de calidad, con una puerta contra comandos
destructivos. El último commit es de junio de 2026: ya no se mantiene y queda como
instantánea de cómo abordé el problema.

**El repositorio público.** Es una instantánea de un solo commit, archivada y de
solo lectura. El historial completo sigue privado, por eso el conteo de commits de
arriba dice historial privado. El servidor detrás de las funciones en la nube no
forma parte de él.

**Qué hace.** Expone esa memoria sobre el Model Context Protocol como veinticinco
herramientas: notas de arquitectura, fixes pasados, convenciones y las relaciones
entre ellas.

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
disponible. La consecuencia es que funciona sin API key y sin red: peor
recuperación, pero nunca una falla dura.
