---
title: An amount that could be read two ways
lang: en
date: 2023-01-20
summary: In a bulk payout built from a spreadsheet, 1.000 can mean one thousand or one. The fix was not a smarter parser — it was refusing to guess.
outcome: Dots and commas are accepted only as the decimal separator. An amount that breaks the rule is rejected at its exact row and column before the batch is built, instead of being read one way and paid another.
project: Loopay
tags: [payments, correctness, input-validation]
---

*Written in 2026, about work from January 2023.*

## The problem

The bulk payout builder is a spreadsheet in the browser: one row per
beneficiary, one column for the amount. People paste those amounts from their
own files, and their files do not agree on what a dot means. In one convention
`1.000,50` is a thousand; in the other, `1,000.50` is.

Read with the wrong convention, an amount is off by a factor of a thousand. In a
payout batch the amount is not a display value. It is the money that leaves.

## The constraint

The builder cannot know which convention a given person used. The cell holds a
string, and both readings are valid numbers. Any parser that works out the
"right" one is guessing, and a guess on an amount is a decision nobody approved.

## The decision

Refuse to guess. In an amount cell, a dot or a comma is accepted only as the
decimal separator. A value that uses one to group thousands is rejected with a
message that says exactly that, and points to the row and column where it is.
A comma used as the decimal separator is normalised to a dot before the batch
totals are computed.

It costs the person one retyped cell. Nothing is built from an amount the
builder had to interpret.

## What I would tell someone doing this next

When an input can be read two ways, the safest parser is the one that refuses.
An error that names the cell is cheap. A beneficiary paid a thousand times too
much, or too little, is not — and the place to stop it is where the number is
typed, not wherever it is noticed later.
