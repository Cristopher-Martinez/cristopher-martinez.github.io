---
name: project-brain
lang: en
status: closed
summary: An MCP server and VS Code extension that gives coding agents durable, searchable memory of a codebase — hybrid retrieval over a local index, no API key required.
stack: [TypeScript, MCP, RAG, Hybrid search, SQLite, VS Code API]
stats:
  - { value: '25', label: 'MCP tools' }
  - { value: '181', label: 'tests' }
  - { value: '839', label: 'commits' }
order: 1
---

Coding agents forget everything between sessions. project-brain gives them a
project-scoped memory they can query: architecture notes, past fixes, conventions
and the relations between them, exposed over the Model Context Protocol as
twenty-five tools.

**Retrieval is hybrid, not just vector search.** Each result scores cosine
similarity against the query embedding and a keyword match, blended at a
configurable weight defaulting to 0.7 in favour of the semantic side, then
passed through a rerank stage that boosts on context before the top-k cut.
Pure vector search misses exact identifiers — a function name is a keyword
problem, not a semantic one.

**Chunking is content-aware.** Prose splits at 1200 characters with 150 of
overlap; code splits at 1600 with 300. Code needs the bigger window because a
function truncated mid-body retrieves as noise, and it needs the bigger overlap
because the signature and the body must be able to land in the same chunk.

**Embeddings degrade gracefully.** Providers sit behind a strategy registry that
resolves in order: a remote embedding server when one is configured, and a local
TF-IDF implementation that is always available. The consequence is that the thing
works with no API key and no network — worse retrieval, but never a hard failure.
