---
title: Every new payment provider cost what the first one cost
lang: en
date: 2023-11-29
summary: Each integration arrived with its own webhook and got its own implementation. The fix was not a faster pipeline — it was separating what every provider shares from the small part where they differ.
outcome: Adding a provider stopped being a project and became implementing one strategy against a defined contract. The shared path — receiving, logging, dispatching — is written once and every integration inherits it.
project: Loopay
tags: [payments, webhooks, architecture, integration]
---

*Written in 2026, about work from November 2023.*

## The problem

The first provider integration had a webhook. So did the second. Each one was
written from scratch: receive the call, work out what the payload means, turn it
into something the platform understands, and act on it.

That is fine with one. With two it is a coincidence. By the third it is a
pattern nobody has named yet, and **the tenth integration costs exactly what the
first one cost** — which is the definition of something that does not scale.

Note that this is not a throughput problem. Nothing was falling over under
load. What did not scale was the cost of saying yes to the next integration.

## The constraint

Providers agree on nothing. The shape of the payload, which field carries the
status, what a retry looks like, what they expect in the response — all of it
differs, and none of it is negotiable from our side. You cannot normalise a
third party by wishing.

The same problem existed pointing outward: companies on the platform wanted
notifications delivered to their own endpoints. Same shape, arrows reversed.

## What I discarded

**One handler with a branch per provider.** It is the obvious move and it works
for two. By four it is a function nobody volunteers to open, where every change
touches every integration and the blast radius of a mistake is all of them at
once.

## The decision

Separate what every provider shares from the small part where they differ.

Receiving, logging the delivery, and dispatching into the domain are the same
work every time, so they are written once. Interpreting a provider's payload is
the only genuinely per-provider piece, so it lives behind a strategy with a
defined contract.

Adding an integration became implementing that contract, not building a second
pipeline beside the first.

## What I would tell someone doing this next

The trap is reaching for the abstraction at integration two, when there is not
enough evidence yet about which parts actually vary — you end up with a contract
shaped around a coincidence.

Two is a coincidence. Three is where the shape becomes visible. Waiting that
long feels like accumulating debt, and it is cheaper than abstracting the wrong
axis and then having to undo it across every integration you already have.
