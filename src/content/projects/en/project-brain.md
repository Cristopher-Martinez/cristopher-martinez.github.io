---
name: project-brain
lang: en
status: open
repo: https://github.com/Cristopher-Martinez/project-brain-vscode
summary: VS Code extension and MCP server that gives coding agents a permanent memory of a codebase that grows with it, so they spend fewer tokens. Built February to June 2026 and kept as a reference snapshot.
stack: [TypeScript, MCP, RAG, Hybrid search, SQLite, VS Code API]
stats:
  - { value: '25', label: 'MCP tools' }
  - { value: '181', label: 'tests' }
  - { value: '839', label: 'commits, private history' }
order: 1
---

**Why it exists.** I wanted to spend fewer tokens in VS Code. Coding agents forget
everything between sessions and rediscover the same project every time, so
project-brain gives them a permanent memory that grows with the codebase: the
project's own documents, indexed as vectors and embeddings, that an agent can query
instead of rereading. By February 12 the token economy was written down as a design
principle, and every skill learned was meant to save tokens on the next task.

**Built early, and it shows.** The first commit is from February 1, 2026, about two
months after VS Code first shipped
[Agent Skills](https://code.visualstudio.com/updates/v1_107) as an experimental
feature. February is memory, vectors and token economy, together with the first
hooks. March is dominated by hooks, validation gates and loop and swarm-style
orchestration: the harnesses around the agents' iterations, there to catch mistakes
and keep an agent on the intended path. On May 31 a portable quality-gate engine
lands, with a gate against destructive commands. The last commit is from June 2026.
It is no longer maintained and stands as a snapshot of how I approached the problem.

**The public repository.** It is a single-commit snapshot, archived and read-only.
The full history stays private, which is why the commit count above is labelled
as private history. The server behind the cloud features is not part of it.

**What it does.** It exposes that memory over the Model Context Protocol as
twenty-five tools: architecture notes, past fixes, conventions and the relations
between them.

**Retrieval is hybrid, not just vector search.** Each result scores cosine
similarity against the query embedding and a keyword match, blended at a
configurable weight defaulting to 0.7 in favour of the semantic side, then
passed through a rerank stage that boosts on context before the top-k cut.
Pure vector search misses exact identifiers: a function name is a keyword
problem, not a semantic one.

**Chunking is content-aware.** Prose splits at 1200 characters with 150 of
overlap; code splits at 1600 with 300. Code needs the bigger window because a
function truncated mid-body retrieves as noise, and it needs the bigger overlap
because the signature and the body must be able to land in the same chunk.

**Embeddings degrade gracefully.** Providers sit behind a strategy registry that
resolves in order: a remote embedding server when one is configured, and a local
TF-IDF implementation that is always available. The consequence is that the thing
works with no API key and no network: worse retrieval, but never a hard failure.
