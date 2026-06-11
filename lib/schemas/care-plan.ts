import { z } from "zod";

export const carePlanSectionStatusSchema = z.enum([
  "ready",
  "missing_information",
  "verify_with_clinician",
  "verify_live"
]);

export const carePlanItemKindSchema = z.enum([
  "recommendation",
  "question",
  "safety",
  "resource",
  "context"
]);

export const evidenceLevelSchema = z.enum([
  "clinical_guideline",
  "patient_education",
  "navigation_resource",
  "demo_context"
]);

export const carePlanItemSchema = z.object({
  text: z.string().trim().min(1),
  action: z.string().trim().optional(),
  label: z.string().trim().optional(),
  kind: carePlanItemKindSchema.default("context"),
  evidenceLevel: evidenceLevelSchema.optional(),
  sourceIds: z.array(z.string().trim().min(1)).default([]),
  requiresClinicianClearance: z.boolean().default(false)
});

export const carePlanSectionSchema = z.object({
  id: z.string().trim().min(1),
  title: z.string().trim().min(1),
  category: z.string().trim().min(1),
  status: carePlanSectionStatusSchema,
  items: z.array(carePlanItemSchema),
  citations: z.array(z.string().trim().min(1)),
  warnings: z.array(z.string().trim().min(1)),
  nextAction: z.string().trim().min(1)
});

export type CarePlanSection = z.infer<typeof carePlanSectionSchema>;
export type CarePlanSectionStatus = z.infer<typeof carePlanSectionStatusSchema>;
export type CarePlanItemKind = z.infer<typeof carePlanItemKindSchema>;
export type EvidenceLevel = z.infer<typeof evidenceLevelSchema>;
