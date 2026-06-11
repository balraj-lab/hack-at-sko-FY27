import { z } from "zod";

const listSchema = z
  .array(z.string().trim().min(1))
  .default([])
  .transform((items) => Array.from(new Set(items)));

export const careProfileSchema = z.object({
  patientName: z.string().trim().min(1).max(80),
  diagnosis: z.string().trim().min(1).max(120),
  tumorSubtype: z.string().trim().min(1).max(160),
  stage: z.string().trim().min(1).max(80),
  age: z.number().int().min(18).max(120),
  zipCode: z.string().regex(/^\d{5}$/, "Use a 5 digit ZIP code."),
  insuranceType: z.string().trim().min(1).max(120),
  preferredLanguage: z.string().trim().min(1).max(80),
  careStatus: z.string().trim().min(1).max(220),
  careGoals: listSchema,
  constraints: listSchema,
  medications: listSchema,
  allergies: listSchema,
  dietBaseline: z.string().trim().min(1).max(240),
  exerciseBaseline: z.string().trim().min(1).max(240),
  supportNeeds: listSchema,
  topConcerns: listSchema,
  sampleMode: z.boolean()
});

export type CareProfile = z.infer<typeof careProfileSchema>;

export type ReviewStatus =
  | "entered_by_user"
  | "needs_confirmation"
  | "missing_information";

export interface ProfileReviewItem {
  label: string;
  value: string;
  status: ReviewStatus;
  note: string;
}

export function parseListInput(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function serializeListInput(value: string[]): string {
  return value.join(", ");
}

export function validateCareProfile(profile: unknown) {
  return careProfileSchema.safeParse(profile);
}

export function buildProfileReview(profile: CareProfile): ProfileReviewItem[] {
  return [
    {
      label: "Diagnosis",
      value: profile.diagnosis,
      status: "entered_by_user",
      note: "Use as the starting point for care-navigation questions."
    },
    {
      label: "Tumor subtype",
      value: profile.tumorSubtype,
      status: profile.tumorSubtype.toLowerCase().includes("unknown")
        ? "needs_confirmation"
        : "needs_confirmation",
      note: "Confirm receptor status and subtype with the oncology team."
    },
    {
      label: "Stage",
      value: profile.stage,
      status: profile.stage.toLowerCase().includes("not confirmed")
        ? "needs_confirmation"
        : "needs_confirmation",
      note: "Stage can change after imaging or lymph node evaluation."
    },
    {
      label: "Location and insurance",
      value: `${profile.zipCode}, ${profile.insuranceType}`,
      status: "entered_by_user",
      note: "Used for provider, hospital, and cost-navigation prompts."
    },
    {
      label: "Care goals",
      value: serializeListInput(profile.careGoals),
      status: profile.careGoals.length ? "entered_by_user" : "missing_information",
      note: "Drives the next-step checklist and appointment preparation."
    },
    {
      label: "Support needs",
      value: serializeListInput(profile.supportNeeds),
      status: profile.supportNeeds.length ? "entered_by_user" : "missing_information",
      note: "Used to suggest social work, therapy, caregiver, and local resources."
    }
  ];
}
