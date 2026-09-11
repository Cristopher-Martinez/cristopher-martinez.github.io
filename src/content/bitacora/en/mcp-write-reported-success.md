---
title: The MCP write that reported success and saved nothing
lang: en
date: 2026-06-14
summary: Reads and writes resolved to two different physical stores. Every write returned success, and the bytes landed somewhere nobody ever read from.
outcome: Write resolution is now symmetric with read resolution, and foreign entries survive a rewrite. The silent data loss is gone; the lesson about trusting return values is not.
project: project-brain
tags: [mcp, debugging, data-integrity]
---

## The problem

Memories written through the MCP server came back `success`. They were not in the
repository. Searching for them returned nothing, and the files were not on disk
where the store was supposed to be.

Nothing had thrown. Nothing had logged a warning. The tool had done exactly what
it was asked, reported that it worked, and lost the data.

## The constraint

The store is resolved at runtime, not configured: the server looks for a
committed memory directory inside the project and falls back to a private
per-server cache when there is none. That fallback is correct — a server
started outside any project still has to work.

## What I discarded

My first instinct was that the write was failing silently and needed better
error handling. It was not failing. It was succeeding, at the wrong address.
Wrapping it in more error handling would have produced the same wrong behaviour
with more logging around it.

## The decision

The read path resolved project-first; the write path always returned local
storage. Two resolvers, one asymmetric. The fix was to make write resolution
mirror read resolution rather than to add a check on top — an invariant that
holds by construction beats one a reviewer has to remember.

A second, quieter bug came out with it: rewriting the opinions file dropped
entries it had not written itself. Those are preserved now.

## What surprised me

How long it hid. A write tool that returns `success` is trusted, so nobody goes
looking. The failure was only visible by checking the filesystem for bytes that
should have been there — which is not something you do unless you already
suspect the return value is lying.

The general shape of it: **a return value is a claim about what happened, and a
claim is not evidence.** Where the write matters, verify it landed.
