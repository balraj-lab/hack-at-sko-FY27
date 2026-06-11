import type { CareProfile } from "@/lib/schemas/care-profile";

export const sampleCareProfile: CareProfile = {
  patientName: "Maria Thompson",
  diagnosis: "New breast cancer diagnosis",
  tumorSubtype: "ER-positive, PR-positive, HER2-negative invasive ductal carcinoma",
  stage: "Stage not confirmed yet",
  age: 48,
  zipCode: "94110",
  insuranceType: "PPO insurance",
  preferredLanguage: "English and Spanish",
  careStatus: "Biopsy completed, oncology visit scheduled, surgeon not yet selected",
  careGoals: [
    "Understand treatment options",
    "Prepare for first oncology visit",
    "Reduce cost surprises",
    "Decide whether to seek a second opinion"
  ],
  constraints: [
    "Wants care near home",
    "Needs appointments around work",
    "Prefers bilingual resources",
    "Worried about transportation"
  ],
  medications: ["Sertraline", "Vitamin D"],
  allergies: ["Penicillin"],
  dietBaseline: "Lactose intolerant and wants high-protein options",
  exerciseBaseline: "Walks 20 minutes twice weekly",
  supportNeeds: [
    "Help telling family",
    "Support group",
    "Therapy options",
    "Financial counseling",
    "Caregiver checklist"
  ],
  topConcerns: [
    "Treatment side effects",
    "Cost",
    "Whether to get a second opinion",
    "How to tell family"
  ],
  sampleMode: true
};
