---
title: A reconciliation that came out two cents off
lang: en
date: 2023-01-20
summary: Two cents is small enough to wave away and large enough to prove the system is wrong. The amount was never the problem — the problem was what tolerating it costs you afterwards.
outcome: Money arithmetic moved to exact decimal operations. A difference in a reconciliation is a signal again, instead of noise everyone learns to ignore.
project: LoopPay
tags: [payments, correctness, decimals]
---

## The problem

A reconciliation did not balance. The difference was two cents.

Two cents is the worst possible amount to be wrong by. It is too small to
justify stopping anything, and too large to be nothing. The tempting move is to
round it away and move on, and that move is how organisations end up unable to
tell a rounding artefact from money that actually went missing.

## The constraint

This is not a bug in the ordinary sense. Nothing threw, no test failed, no
branch was obviously wrong. Binary floating point simply cannot represent most
decimal fractions exactly — the canonical demonstration is that adding a tenth
to two tenths does not produce three tenths.

Per operation the error is far below a cent and invisible. Across a batch it
accumulates, and it accumulates *differently* depending on the order operations
happened to run in. That last part is what makes it miserable to chase: run the
same reconciliation twice over the same data in a different order and you can
get a different discrepancy.

## What I discarded

**Rounding at the end.** It makes this reconciliation balance and teaches the
system to lie quietly. The next difference gets rounded too, including the one
that was real.

**A tolerance threshold.** "Differences under five cents are acceptable" sounds
pragmatic and is the same decision wearing a suit — you have written down the
size of the lie you will accept, and from then on you cannot detect anything
smaller than it.

## The decision

Stop doing money arithmetic in floating point. Operations on amounts go through
exact decimal arithmetic, so the result of a sum is the result, not the nearest
representable approximation to it.

It is less convenient. Every addition is a function call instead of an operator,
and the code reads worse. That is the whole cost, and it buys the ability to
treat a non-zero difference as information.

## What I would tell someone doing this next

The instinct is to treat this as a precision problem and reach for more decimal
places. It is not. It is a **representation** problem, and more precision only
moves the error further down where it takes longer to notice.

And the real damage is never the two cents. It is that once a system is allowed
to be slightly wrong about money, nobody can use it to answer the question it
exists to answer.
