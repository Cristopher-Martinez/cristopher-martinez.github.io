import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'zod';

/**
 * zod is imported directly rather than re-exported from `astro:content` or
 * `astro:schema`; both re-exports are deprecated in Astro 7, and a direct
 * dependency beats relying on a transitive one resolving.
 *
 * Entries live under `<collection>/<lang>/<slug>.md`. Keeping the language in
 * the path rather than only in frontmatter means a translation pair shares a
 * filename, so pairing them for hreflang is a string operation, not a lookup
 * table someone has to remember to update.
 */
const langDir = z.enum(['en', 'es']);

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z
    .object({
      name: z.string().min(1),
      lang: langDir,
      /** `live` products link out; `open` ones link to source; `closed` shows neither. */
      status: z.enum(['live', 'open', 'closed']),
      summary: z.string().min(1).max(280),
      url: z.url().optional(),
      repo: z.url().optional(),
      stack: z.array(z.string()).min(1),
      stats: z
        .array(z.object({ value: z.string(), label: z.string() }))
        .max(4)
        .optional(),
      order: z.number().int().default(99),
      draft: z.boolean().default(false),
    })
    .refine((p) => p.status !== 'live' || Boolean(p.url), {
      message: 'A project marked `live` must carry the url it is live at.',
      path: ['url'],
    })
    .refine((p) => p.status !== 'open' || Boolean(p.repo), {
      message: 'A project marked `open` must carry the repo url.',
      path: ['repo'],
    }),
});

const bitacora = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/bitacora' }),
  schema: z.object({
    title: z.string().min(1).max(90),
    lang: langDir,
    date: z.coerce.date(),
    summary: z.string().min(1).max(220),
    /**
     * The measured result. Required on purpose: an engineering log whose
     * entries stop at "and then I built it" reads as marketing. This is the
     * field people skip, so the build refuses the entry without it.
     */
    outcome: z.string().min(1),
    project: z.string().optional(),
    tags: z.array(z.string()).max(5).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { projects, bitacora };
