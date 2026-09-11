---
name: velocitystream
lang: en
status: live
url: https://istemp.xyz
summary: Self-hosted video platform with an automated transcoding pipeline and per-video quality scoring, running in production behind its own CDN edge.
stack: [Node, React, FFmpeg, HLS, BullMQ, Redis, Prisma, Docker]
stats:
  - { value: '627', label: 'files' }
  - { value: '134', label: 'tests' }
  - { value: '5', label: 'deploy pipelines' }
order: 4
---

Upload anything, get adaptive HLS back. Transcoding runs as queued work rather
than inline with the request, because an eight-minute FFmpeg job does not belong
on a connection somebody is waiting on.

**Quality is measured, not assumed.** Every output is scored with VMAF against
its source. Targeting a score instead of a bitrate is what keeps the ladder
honest: a bitrate that looks fine on an interview scene falls apart on grain and
motion, and without a score nobody notices until a viewer does.

Originals are deleted once the ladder is verified, which is the difference
between a storage bill that grows with the catalogue and one that grows with
what people actually watch.

**On the stack, honestly:** this is the oldest piece of the ecosystem and it is
JavaScript, not TypeScript. The capability packages it grew into — typed,
contract-bound, in `velocityanime` — exist because operating this taught me
where the seams needed to be. The migration is the architecture decision, not a
debt I am hiding.
