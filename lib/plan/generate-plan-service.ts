import { generatePlanWithFallback, type GeneratePlanResult } from "@/lib/ai/generate-plan";
import { evaluatePhiGuard } from "@/lib/privacy/phi-guard";
import { validateCareProfile } from "@/lib/schemas/care-profile";

export type GeneratePlanServiceResponse =
  | {
      ok: true;
      result: GeneratePlanResult;
    }
  | {
      ok: false;
      status: number;
      error: string;
      reasons: string[];
    };

export async function generatePlanService(input: unknown): Promise<GeneratePlanServiceResponse> {
  const parsed = validateCareProfile(input);

  if (!parsed.success) {
    return {
      ok: false,
      status: 400,
      error: "Invalid care profile.",
      reasons: parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    };
  }

  const phiGuard = evaluatePhiGuard(parsed.data);

  if (!phiGuard.allowed) {
    return {
      ok: false,
      status: 403,
      error: "Generation blocked by the synthetic-data guard.",
      reasons: phiGuard.reasons
    };
  }

  const result = await generatePlanWithFallback(parsed.data);

  if (!result.safety.allowed) {
    return {
      ok: false,
      status: 422,
      error: "Generated plan failed the safety pass.",
      reasons: result.safety.findings.map((finding) => finding.message)
    };
  }

  return {
    ok: true,
    result
  };
}
