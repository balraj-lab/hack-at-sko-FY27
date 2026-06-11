import type { CareProfile } from "@/lib/schemas/care-profile";

export interface PhiGuardResult {
  allowed: boolean;
  reasons: string[];
}

const emailPattern = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
const phonePattern = /(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)\d{3}[-.\s]?\d{4}/;
const ssnPattern = /\b\d{3}-\d{2}-\d{4}\b/;
const streetPattern =
  /\b\d{1,6}\s+[A-Za-z0-9.'-]+(?:\s+[A-Za-z0-9.'-]+){0,4}\s+(Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Court|Ct|Way)\b/i;

export function evaluatePhiGuard(profile: CareProfile): PhiGuardResult {
  const reasons: string[] = [];
  const searchableText = [
    profile.patientName,
    profile.diagnosis,
    profile.tumorSubtype,
    profile.stage,
    profile.insuranceType,
    profile.preferredLanguage,
    profile.careStatus,
    profile.dietBaseline,
    profile.exerciseBaseline,
    ...profile.careGoals,
    ...profile.constraints,
    ...profile.medications,
    ...profile.allergies,
    ...profile.supportNeeds,
    ...profile.topConcerns
  ].join(" ");

  if (!profile.sampleMode) {
    reasons.push("Generation is disabled unless sampleMode is true.");
  }

  if (emailPattern.test(searchableText)) {
    reasons.push("Remove email addresses before using this demo.");
  }

  if (phonePattern.test(searchableText)) {
    reasons.push("Remove phone numbers before using this demo.");
  }

  if (ssnPattern.test(searchableText)) {
    reasons.push("Remove government identifiers before using this demo.");
  }

  if (streetPattern.test(searchableText)) {
    reasons.push("Remove street addresses before using this demo.");
  }

  return {
    allowed: reasons.length === 0,
    reasons
  };
}
