---
title: Running models my laptop can't hold without paying for a GPU I forgot
lang: en
date: 2026-06-19
summary: I rent GPUs by the hour to run open models my laptop cannot hold. The risk is the box that keeps billing after the process that rented it dies. The fix was to make the rental state reconcilable.
outcome: After a restart the panel shows the still-running instance again, with its real uptime and a working Destroy button, instead of a ghost that bills unseen. Re-adoption covers one instance at a time, which is all the app rents.
project: velocitygpu
tags: [infra, gpu, reliability]
---

## Where it started

A 14B to 32B model does not fit on my laptop, and I wanted to run them anyway.
Renting a GPU by the hour is cheap, so
[velocitygpu](https://github.com/Cristopher-Martinez/velocitygpu) automates the
whole "I need a bigger GPU for an hour" workflow: find a machine, boot Ollama on
it, pull the model, wait until it is really resident in VRAM, and chat with it
from one page.

Doing that by hand fails in boring ways. Offers vanish between the search and
the rental, some hosts crash on start, a multi-gigabyte download takes minutes,
and a forgotten instance keeps billing. This entry is about the last one.

## The problem

Renting is not one operation. It is five: search offers, create the instance,
wait for the container to answer, pull the model, and wait until it is warm in
VRAM. The rental state lives only in the server's memory. If the process
restarts, by crash, by deploy or because the port was taken, it loses track of a
machine that is still running and still billing.

## The constraint

There is no other server of mine to remember what I started. The only durable
record that a box is mine lives on the provider's side, and in a process that
may just have died.

## What I discarded

**Cleanup in a `finally` block.** It is the obvious first move, and the
end-to-end script does use it, with signal handlers on top. But it only covers
the failures the process survives. Kill it, lose the power, close the laptop:
the box keeps running. Even there the README tells you to confirm in the
console anyway.

**vLLM across several GPUs.** The first commit of the proof of concept, on June
18 in my private monorepo, rented a multi-GPU box and served the model with vLLM.
(The public repository was published with a fresh history in October 2026.) By the next day it was
Ollama on a single GPU. The code keeps the reasons in its comments: with Ollama
the machine starts empty and the model is pulled after boot, so one image serves
any model, and asking for more GPUs than the model uses means paying for idle
cards and, on some hosts, a container device error.

## The decision

Treat the provider's account as the source of truth and ask it on boot. The
reconciler lists the instances that are alive and recognises its own by the
official Ollama image. That is a heuristic, not an ownership check: another Ollama
box on the same account would match too, which is acceptable for a single-user
tool. It takes the most recently started one and rebuilds the state: the
physical host, the real uptime from the contract's start, and the model, which
it reads from Ollama's own list of pulled models. Then it probes the endpoint to
place the box in the right phase. The panel shows the instance again and the
Destroy button works.

All the decision logic is pure functions with tests. The few network calls sit at
the edges, and any failure in them is swallowed so a bad connection never keeps
the server from starting. It runs only when the store is idle, so it never
overwrites a rental that is already tracked.

That changes the question from "did my cleanup code run?" to "does the world
match what I think I own?". The second one survives a process that never got to
run any code.

## What surprised me

Right after creation the provider returns an empty actual status while the
machine is already running. Judging liveness by one field would have treated
fresh boxes as dead, so the check accepts any of three signals.

## What is still open

One rental at a time, no idle shutdown, and no authentication on the app server.
The README calls it a proof of concept in its opening lines and lists these limits
in their own section.

## Where it went next

The same rental approach now runs video transcoding in
[velocitykeep](/work/velocitykeep/), with one difference that changes
everything: a queue triggers it instead of a person.
[That entry](/bitacora/gpu-autoscaler-for-transcoding/) covers the failure modes
that appear once no human is watching.
