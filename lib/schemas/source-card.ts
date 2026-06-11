import { z } from "zod";

export const sourceCardSchema = z.object({
  id: z.string().trim().min(1),
  title: z.string().trim().min(1),
  organization: z.string().trim().min(1),
  url: z.string().url(),
  retrievedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  tags: z.array(z.string().trim().min(1)).min(1),
  summary: z.string().trim().min(1),
  allowedSections: z.array(z.string().trim().min(1)).min(1)
});

export type SourceCard = z.infer<typeof sourceCardSchema>;
