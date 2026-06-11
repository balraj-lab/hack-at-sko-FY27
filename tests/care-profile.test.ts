import { describe, expect, it } from "bun:test";
import { sampleCareProfile } from "@/data/sample-profile";
import {
  buildProfileReview,
  parseListInput,
  validateCareProfile
} from "@/lib/schemas/care-profile";
import { sourceRegistry } from "@/data/source-registry";
import { sourceCardSchema } from "@/lib/schemas/source-card";

describe("careProfileSchema", () => {
  it("accepts the bundled synthetic sample profile", () => {
    const result = validateCareProfile(sampleCareProfile);

    expect(result.success).toBe(true);
  });

  it("requires a valid five digit ZIP code", () => {
    const result = validateCareProfile({
      ...sampleCareProfile,
      zipCode: "9411"
    });

    expect(result.success).toBe(false);
  });

  it("parses comma-separated list inputs", () => {
    expect(parseListInput("cost, support, cost")).toEqual(["cost", "support", "cost"]);
  });
});

describe("profile review", () => {
  it("marks subtype and stage as clinician-confirmation items", () => {
    const review = buildProfileReview(sampleCareProfile);
    const subtype = review.find((item) => item.label === "Tumor subtype");
    const stage = review.find((item) => item.label === "Stage");

    expect(subtype?.status).toBe("needs_confirmation");
    expect(stage?.status).toBe("needs_confirmation");
  });
});

describe("source registry", () => {
  it("keeps trusted sources structured and dated", () => {
    for (const source of sourceRegistry) {
      const result = sourceCardSchema.safeParse(source);

      expect(result.success).toBe(true);
    }
  });
});
