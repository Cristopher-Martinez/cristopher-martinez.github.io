---
title: The GPU rental that kept billing after the deploy failed
lang: en
date: 2026-06-14
summary: A half-failed provision left a Vast.ai box running with nobody tracking it. The fix was not better error handling, it was making the rental state reconcilable.
outcome: Orphaned instances now close within one reconcile pass. No unattended box has outlived its session since.
project: velocitygpu
tags: [infra, gpu, reliability]
---

## The problem

Renting a GPU box is not one operation, it is four: query offers, create the
instance, wait for the container to come up, then probe vLLM until it answers.
A failure in step three leaves a machine running and billing, with the process
that created it already gone.

## The constraint

Vast.ai bills by the second and there is no server of mine to remember what I
started. The only durable record of "I own this box" lived in a local process
that had just crashed.

## What I discarded

A `try/finally` around the provision call was the obvious first move, and it is
not enough: it only covers the crash paths the process survives. Kill the
process, lose the power, close the laptop — the box keeps running.

## The decision

Treat the rental as reconcilable state rather than a transaction. The store
records intent before the API call, and a reconcile pass compares intended
rentals against what Vast.ai actually reports, closing anything that exists
remotely but not locally.

That inverts the question from "did my cleanup code run?" to "does the world
match what I intended?" — the second one survives a process that never got to
run any code at all.

## What surprised me

The reconciler found orphans from runs I had already forgotten about. The bug
had been silently costing money for longer than the feature had existed.
