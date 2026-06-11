import { buildCachedSamplePlan } from "@/data/cached-sample-plan";
import { tryGenerateModelPlan } from "@/lib/ai/model-adapter";
import { attachSourcesToPlan } from "@/lib/plan/source-attachment";
import type { CareProfile } from "@/lib/schemas/care-profile";
import type { CarePlanSection } from "@/lib/schemas/care-plan";
import type { SourceCard } from "@/lib/schemas/source-card";
import { runSafetyPass, type SafetyPassResult } from "@/lib/safety/safety-pass";

export type GenerationMode = "cached_sample_fallback" | "model_adapter";

export interface GeneratePlanResult {
  mode: GenerationMode;
  generatedAt: string;
  sections: CarePlanSection[];
  sources: SourceCard[];
  safety: SafetyPassResult;
  warnings: string[];
}

export async function generatePlanWithFallback(profile: CareProfile): Promise<GeneratePlanResult> {
  const modelResult = await tryGenerateModelPlan(profile);

  if (modelResult.status === "generated") {
    const safety = runSafetyPass(modelResult.sections);

    if (safety.allowed) {
      return buildPlanResult({
        mode: "model_adapter",
        sections: modelResult.sections,
        safety,
        warnings: [
          "Model adapter generated this sample-only plan.",
          "All medical decisions must be confirmed with licensed clinicians."
        ]
      });
    }

    return buildCachedFallback(
      profile,
      "Model adapter output failed the safety pass; using cached sample fallback."
    );
  }

  const fallbackWarning =
    modelResult.status === "disabled"
      ? "Live model adapter is disabled; using cached sample fallback."
      : modelResult.status === "skipped"
        ? modelResult.reason
        : `Model adapter unavailable: ${modelResult.reason}. Using cached sample fallback.`;

  return buildCachedFallback(profile, fallbackWarning);
}

function buildCachedFallback(profile: CareProfile, fallbackWarning: string): GeneratePlanResult {
  const sections = buildCachedSamplePlan(profile);
  const safety = runSafetyPass(sections);

  return buildPlanResult({
    mode: "cached_sample_fallback",
    sections,
    safety,
    warnings: [
      fallbackWarning,
      "This cached fallback uses synthetic sample data only.",
      "All medical decisions must be confirmed with licensed clinicians."
    ]
  });
}

function buildPlanResult({
  mode,
  sections,
  safety,
  warnings
}: {
  mode: GenerationMode;
  sections: CarePlanSection[];
  safety: SafetyPassResult;
  warnings: string[];
}): GeneratePlanResult {
  const sources = attachSourcesToPlan(sections);

  return {
    mode,
    generatedAt: new Date().toISOString(),
    sections,
    sources,
    safety,
    warnings
  };
}
