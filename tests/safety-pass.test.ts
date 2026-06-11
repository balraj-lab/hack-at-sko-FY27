import { describe, expect, it } from "bun:test";
import { runSafetyPass } from "@/lib/safety/safety-pass";
import type { CarePlanSection } from "@/lib/schemas/care-plan";

const safeSection: CarePlanSection = {
  id: "safe",
  title: "Safe Section",
  category: "summary",
  status: "ready",
  items: [
    {
      text: "Ask your oncology team what information still needs confirmation.",
      kind: "question",
      evidenceLevel: "patient_education",
      sourceIds: ["nci-breast-cancer"],
      requiresClinicianClearance: false
    }
  ],
  citations: ["nci-breast-cancer"],
  warnings: [],
  nextAction: "Bring questions to the appointment."
};

describe("runSafetyPass", () => {
  it("allows safe section content", () => {
    const result = runSafetyPass([safeSection]);

    expect(result.allowed).toBe(true);
    expect(result.findings).toEqual([]);
  });

  it("blocks cure claims", () => {
    const result = runSafetyPass([
      {
        ...safeSection,
        items: [
          {
            text: "This will cure cancer.",
            kind: "recommendation",
            evidenceLevel: "patient_education",
            sourceIds: ["nci-breast-cancer"],
            requiresClinicianClearance: false
          }
        ]
      }
    ]);

    expect(result.allowed).toBe(false);
    expect(result.findings.some((finding) => finding.rule === "no-cure-claims")).toBe(true);
  });

  it("warns when non-safety sections have no citations", () => {
    const result = runSafetyPass([
      {
        ...safeSection,
        citations: []
      }
    ]);

    expect(result.allowed).toBe(true);
    expect(result.findings.some((finding) => finding.rule === "citation-required")).toBe(true);
  });
});
