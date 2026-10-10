---
name: velocitygpu
lang: en
status: open
repo: https://github.com/Cristopher-Martinez/velocitygpu
summary: Rent a GPU on Vast.ai, serve an open-weight LLM with Ollama, and chat with it from one page. Built to run models my own machine cannot hold.
stack: [Node, Ollama, Vast.ai, Electron]
stats:
  - { value: '36', label: 'files' }
  - { value: '0', label: 'runtime deps' }
  - { value: '257', label: 'tests' }
order: 2
---

A 14B to 32B model does not fit on a laptop, and I wanted to run them anyway.
Renting a GPU by the hour is cheap. Doing it by hand is not: offers vanish
between the search and the rental, some hosts crash on start, a multi-gigabyte
download takes minutes, and a forgotten instance keeps billing. velocitygpu is
the glue that handles those failure modes: pick a model, rent, watch the
deployment, chat.

It searches Vast.ai for a machine that fits the model, ranks the offers
(skipping hosts that failed before and preferring hosts that worked), starts
the official Ollama image, pulls the model, and waits until it is actually
resident in VRAM before it says ready.

The hard part was not the happy path. It was keeping the rental honest when
something dies halfway. The state lives only in memory, so a reconciler asks
Vast on boot what is still running, re-adopts the box with its real uptime, and
recovers which model it serves.
[The log entry](/bitacora/orphan-gpu-reconciler/) tells that story.

The same rental approach now runs video transcoding in
[velocitykeep](/work/velocitykeep/), triggered by a queue instead of a person.

The limits, plainly: it is a proof of concept. One rental at a time, no
authentication on the app server, no idle shutdown. The README calls it a proof
of concept in its opening lines and lists these limits in their own section.

**About the numbers above.** Counted on the main branch of the public repository: tracked files, runtime dependencies in `package.json`, and the test cases the suite reports when it runs.
