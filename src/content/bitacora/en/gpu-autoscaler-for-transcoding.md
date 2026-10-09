---
title: 'When no human clicks Rent: letting a queue backlog buy GPUs'
lang: en
date: 2026-07-30
summary: In velocitygpu a person rents one GPU. In velocitykeep the transcode backlog does it, and that moves the hard problems from provisioning to spending, trust and cleanup.
outcome: Transcoding scales out to rented GPUs when work piles up and back to zero when the backlog empties. Spend is bounded by a fleet cap per hour, a startup deadline and a zombie reaper, and rented machines hold only short-lived credentials.
project: velocitykeep
tags: [infra, gpu, autoscaling, security]
---

## Where it comes from

[velocitygpu](/bitacora/orphan-gpu-reconciler/) exists because I wanted to run
models my laptop cannot hold: a person picks a model, rents one box and uses it.
The same need shows up in video. Transcoding and post-processing are heavy and
bursty, and a GPU only earns its price while there is work for it.

[velocitykeep](https://velocitykeep.com) is the self-hosted video platform I run
in production, called velocitystream until recently. Its rental code comes from
the same lineage as velocitygpu: a Vast.ai client, ranked offers and a memory of
hosts that failed. It was ported rather than shared, and it had to grow, because
here nobody is watching a panel.

## The problem

When the trigger is a person, a mistake costs one box. When the trigger is a
queue, a mistake costs a fleet. Three failure modes appear that a human in the
loop used to absorb: runaway spend, machines that look alive and do nothing, and
machines I do not control running my workload.

## The constraint

The rented machine belongs to a stranger. It needs enough access to do the job
and no more. And the platform's datastores live on my own server, which must not
be opened to the internet just because a worker needs them.

## What I discarded

**Exposing Redis and Postgres to the workers.** It is the shortest path, and the
one that turns a rented machine into a door.

## The decision

The queue decides, within limits. Every minute the autoscaler compares the
backlog with what the current fleet can work through and rents the difference,
subject to a cooldown and a cap on the fleet's total hourly spend. Offers are
scored before renting: only GPU classes that can run the hardware encoder, above
a driver floor.

The machine is treated as untrusted. It receives a reduced configuration, fetched
at boot with a short-lived key flagged as remote, and it reaches the queue and the
database through a tunnel back to my server instead of through exposed ports.

The box is just another consumer of the existing queue. It runs the same worker in
a GPU mode and takes the transcoding jobs only: thumbnails, audio fingerprint, a
preview pass that searches for the quality setting, the hardware-encoded ladder,
the quality check, encryption and the upload. It writes a heartbeat so the
platform can tell a working machine from a silent one. There is no second
pipeline to maintain.

Cleanup has a single path: destroy on the provider first, then delete the local
record and write a cost ledger entry. A machine that does not report in within
twelve minutes is given up on. One that stops sending heartbeats is destroyed and
its host banned. An idle fleet shuts down when the backlog stays at zero, and a
reconciler prunes instances the provider no longer has.

## What surprised me

A rented box can boot, pass its health check and still be unable to encode. A week
after the first version shipped, the image's GPU toolchain had to be updated so
rented machines could actually run the hardware encoder. Today the boot script
runs an encode smoke test before the box takes work, and offers are filtered by
GPU class and driver.

## What I would tell someone doing this next

Moving the decision from a person to a queue does not remove the person's
judgement. It moves it into limits: a spend cap, a deadline, a heartbeat, a kill
switch. Write those before the autoscaler, not after the first invoice.

The small version of this idea, and the failure it had to survive, is in
[the velocitygpu entry](/bitacora/orphan-gpu-reconciler/). The product that runs
this one is [velocitykeep](/work/velocitykeep/).
