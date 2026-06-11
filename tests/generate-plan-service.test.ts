import { describe, expect, it } from "bun:test";
import { sampleCareProfile } from "@/data/sample-profile";
import { generatePlanService } from "@/lib/plan/generate-plan-service";

describe("generatePlanService", () => {
  it("returns cached sample sections, sources, and a clear safety pass", async () => {
    const response = await generatePlanService(sampleCareProfile);

    expect(response.ok).toBe(true);
    if (!response.ok) {
      throw new Error("expected successful generation");
    }

    expect(response.result.mode).toBe("cached_sample_fallback");
    expect(response.result.sections.length).toBeGreaterThanOrEqual(6);
    expect(response.result.sources.length).toBeGreaterThanOrEqual(7);
    expect(response.result.safety.allowed).toBe(true);
    expect(response.result.sections.map((section) => section.id)).toContain("insurance");

    const attachedSourceIds = new Set(response.result.sources.map((source) => source.id));
    for (const citationId of response.result.sections.flatMap((section) => section.citations)) {
      expect(attachedSourceIds.has(citationId)).toBe(true);
    }
    for (const sourceId of response.result.sections.flatMap((section) =>
      section.items.flatMap((item) => item.sourceIds)
    )) {
      expect(attachedSourceIds.has(sourceId)).toBe(true);
    }
  });

  it("returns actionable nutrition and movement recommendations with evidence metadata", async () => {
    const response = await generatePlanService(sampleCareProfile);

    expect(response.ok).toBe(true);
    if (!response.ok) {
      throw new Error("expected successful generation");
    }

    const nutrition = response.result.sections.find(
      (section) => section.id === "nutrition-exercise"
    );

    expect(nutrition).toBeDefined();
    expect(nutrition?.items.some((item) => item.kind === "recommendation")).toBe(true);
    expect(nutrition?.items.some((item) => item.kind === "question")).toBe(true);
    expect(nutrition?.items.some((item) => item.kind === "safety")).toBe(true);
    expect(
      nutrition?.items.some((item) => item.evidenceLevel === "clinical_guideline")
    ).toBe(true);
    expect(
      nutrition?.items.some((item) =>
        item.text.includes("150-300 minutes per week of moderate activity")
      )
    ).toBe(true);
    expect(nutrition?.items.some((item) => item.requiresClinicianClearance)).toBe(true);
    expect(nutrition?.citations).toContain("acs-survivor-nutrition-activity-guideline");
    expect(nutrition?.citations).toContain("nci-nutrition-during-cancer");
  });

  it("blocks non-sample profile generation", async () => {
    const response = await generatePlanService({
      ...sampleCareProfile,
      sampleMode: false
    });

    expect(response.ok).toBe(false);
    if (response.ok) {
      throw new Error("expected blocked generation");
    }

    expect(response.status).toBe(403);
    expect(response.reasons).toContain("Generation is disabled unless sampleMode is true.");
  });

  it("returns validation errors for malformed profiles", async () => {
    const response = await generatePlanService({
      ...sampleCareProfile,
      zipCode: "not-a-zip"
    });

    expect(response.ok).toBe(false);
    if (response.ok) {
      throw new Error("expected validation failure");
    }

    expect(response.status).toBe(400);
    expect(response.reasons.some((reason) => reason.includes("zipCode"))).toBe(true);
  });
});
