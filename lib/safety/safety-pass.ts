import type { CarePlanSection } from "@/lib/schemas/care-plan";

export type SafetySeverity = "error" | "warning";

export interface SafetyFinding {
  rule: string;
  severity: SafetySeverity;
  message: string;
}

export interface SafetyPassResult {
  allowed: boolean;
  findings: SafetyFinding[];
  checkedAt: string;
}

const unsafePatterns: Array<{ rule: string; pattern: RegExp; message: string }> = [
  {
    rule: "no-cure-claims",
    pattern: /\b(will cure|guaranteed cure|guaranteed outcome|will eliminate cancer)\b/i,
    message: "Output must not claim cures or guaranteed outcomes."
  },
  {
    rule: "no-medication-start-stop",
    pattern: /\b(stop taking|start taking|replace your medication|skip chemotherapy)\b/i,
    message: "Output must not tell users to start, stop, replace, or skip treatment."
  },
  {
    rule: "no-treatment-selection",
    pattern: /\b(you should choose|the best treatment is|do not get surgery)\b/i,
    message: "Output must not choose treatment for the patient."
  }
];

export function runSafetyPass(sections: CarePlanSection[]): SafetyPassResult {
  const findings: SafetyFinding[] = [];
  const combinedText = JSON.stringify(sections);

  for (const unsafe of unsafePatterns) {
    if (unsafe.pattern.test(combinedText)) {
      findings.push({
        rule: unsafe.rule,
        severity: "error",
        message: unsafe.message
      });
    }
  }

  for (const section of sections) {
    if (section.citations.length === 0 && section.category !== "safety") {
      findings.push({
        rule: "citation-required",
        severity: "warning",
        message: `${section.title} has no citations attached.`
      });
    }

    if (!section.nextAction.trim()) {
      findings.push({
        rule: "next-action-required",
        severity: "warning",
        message: `${section.title} needs a next action.`
      });
    }
  }

  return {
    allowed: findings.every((finding) => finding.severity !== "error"),
    findings,
    checkedAt: new Date().toISOString()
  };
}
