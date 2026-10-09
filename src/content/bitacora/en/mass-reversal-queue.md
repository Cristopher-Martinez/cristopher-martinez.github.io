---
title: Moving a reversal queue into the database that holds the money
lang: en
date: 2026-08-05
summary: Undoing a bulk dispersal means writing to every wallet it touched. One transaction cannot hold that, and a queue kept outside the ledger can disagree with it after a crash.
outcome: The queue and the ledger commit together, so a failure mid-batch can no longer leave pending work and balances describing different realities. Recovery is reading state, not reconciling two sources.
project: Loopay
tags: [payments, postgres, queues, data-integrity]
---

## The problem

A mass dispersal credits a batch of wallets in one operation — a bonus, a
subsidy, a correction. Sometimes it has to be undone.

Reversing it is not the same as reversing many payments. It is one business
action that has to land on every account the dispersal touched, and end with all
of them in the same state. Half a reversal is worse than none: now nobody knows
which wallets are right.

## The constraint

The batch spans the whole wallet base — hundreds of thousands of accounts in a
single operation.

That number is what makes this hard, and it is not a performance problem. A
single `updateMany`, or one transaction wrapping the entire reversal, does not
get slow at that size. **It hits a ceiling and fails.** There is a physical limit
to how much work one transaction can hold, and a batch of that shape is on the
wrong side of it. The obvious implementation was not going to be slow. It was
going to be impossible.

## What I discarded

**Iterating and reversing one payment at a time.** Operationally unworkable at
this size, and it has the worst failure mode of the three: it fails partway
through with no record of where, leaving the batch split between reversed and
not.

**One large transaction.** The same wall, reached faster, with the added
property that the database spends a long time holding locks before it gives up.

## The decision

Split the work into queued batches, so no single unit of work is large enough to
hit the ceiling — and then move the queue itself out of Redis and into Postgres,
next to the money.

That second part is the one worth explaining. With the queue in Redis and the
balances in Postgres, enqueueing work and applying it are two writes to two
systems, and **nothing makes them agree**. A crash between them leaves pending
work that was already applied, or applied work still queued. Both are wrong, and
after a partial failure you cannot tell which happened without reconstructing it
by hand.

Putting the queue in the same database means enqueueing and applying share a
transaction. They commit together or neither does. The failure mode does not get
handled better — it stops existing.

## What I would tell someone doing this next

The instinct is to reach for the fast queue, because a queue is infrastructure
and infrastructure should be fast. But a queue that drives money is not
infrastructure — it is part of the ledger. It belongs where the ledger is, and
paying for that in latency is cheaper than paying for it in a reconciliation
nobody can automate.
