import { describe, expect, it } from "bun:test";
import { sampleCareProfile } from "@/data/sample-profile";
import { evaluatePhiGuard } from "@/lib/privacy/phi-guard";

describe("evaluatePhiGuard", () => {
  it("allows the bundled synthetic sample profile", () => {
    expect(evaluatePhiGuard(sampleCareProfile)).toEqual({
      allowed: true,
      reasons: []
    });
  });

  it("blocks generation when sampleMode is disabled", () => {
    const result = evaluatePhiGuard({
      ...sampleCareProfile,
      sampleMode: false
    });

    expect(result.allowed).toBe(false);
    expect(result.reasons).toContain("Generation is disabled unless sampleMode is true.");
  });

  it("blocks obvious contact identifiers", () => {
    const result = evaluatePhiGuard({
      ...sampleCareProfile,
      topConcerns: ["Please call me at 415-555-1212"]
    });

    expect(result.allowed).toBe(false);
    expect(result.reasons).toContain("Remove phone numbers before using this demo.");
  });
});
