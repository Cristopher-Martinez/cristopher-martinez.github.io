---
name: velocitygpu
lang: en
status: closed
summary: Rents a multi-GPU box on Vast.ai and serves a 32B model through vLLM with tensor parallelism, from a single page.
stack: [Node, vLLM, Vast.ai, Electron]
stats:
  - { value: '32', label: 'files' }
  - { value: '0', label: 'runtime deps' }
  - { value: '11', label: 'tests' }
order: 2
---

A 32B model does not fit on one GPU — roughly 64 GB of weights in FP16. The
provisioner therefore searches for an offer with two or more GPUs **on the same
node**, and vLLM splits the model across them over NVLink with
`--tensor-parallel-size`.

The part that took the longest was not the happy path. It was the reconciler
that closes orphaned instances when a rental fails halfway through, because a
GPU box nobody shut down keeps billing.

Runs on the Node standard library: no runtime dependencies at all.
