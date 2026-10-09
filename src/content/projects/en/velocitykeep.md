---
name: velocitykeep
lang: en
status: live
url: https://velocitykeep.com
summary: Self-hosted video platform with queued HLS transcoding on GPUs rented on demand, quality targeted by VMAF, and guest accounts. In production, formerly velocitystream.
stack: [Node, React, FFmpeg, HLS, BullMQ, Redis, Prisma, PostgreSQL, Docker]
stats:
  - { value: '2.2k', label: 'files' }
  - { value: '581', label: 'test files' }
  - { value: '11', label: 'deploy jobs' }
order: 4
---

Upload anything, get adaptive HLS back. Transcoding runs as queued work rather
than inline with the request, because a transcode does not belong on a
connection somebody is waiting on. Delivery is adaptive HLS with AES-128
encryption.

**Quality is targeted, not assumed.** For longer videos a preview pass
binary-searches the encoder's quality setting to land near a target VMAF score,
and the best rendition is then scored against the source. The other renditions
are labelled as estimates instead of being presented as measured.

**Post-processing runs on GPUs rented on demand.** When the transcode backlog
grows, an autoscaler rents Vast.ai machines. Each one runs the same worker
against the same queue, doing thumbnails, audio fingerprinting, the
hardware-encoded ladder, the quality check, encryption and the upload, and the
boxes are destroyed when the work runs out. It is the same rental approach as
[velocitygpu](/work/velocitygpu/), ported rather than shared: there a person
rents one box, here the queue does.
[The log entry](/bitacora/gpu-autoscaler-for-transcoding/) covers what changes
when no human is in the loop.

**On the stack, honestly:** it is the oldest piece of the ecosystem and it is
JavaScript, not TypeScript. The typed, contract-bound capability packages in
[velocityanime](/work/velocityanime/) exist because operating this taught me
where the seams needed to be. The migration is the architecture decision, not a
debt I am hiding.
