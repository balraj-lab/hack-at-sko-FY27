import { describe, expect, it } from "bun:test";
import { POST } from "@/app/api/generate-plan/route";
import { sampleCareProfile } from "@/data/sample-profile";

describe("POST /api/generate-plan", () => {
  it("returns a cached sample fallback plan for the bundled sample profile", async () => {
    const response = await POST(
      new Request("http://127.0.0.1:3000/api/generate-plan", {
        method: "POST",
        body: JSON.stringify(sampleCareProfile),
        headers: {
          "Content-Type": "application/json"
        }
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(payload.result.mode).toBe("cached_sample_fallback");
    expect(payload.result.safety.allowed).toBe(true);
  });

  it("rejects malformed JSON", async () => {
    const response = await POST(
      new Request("http://127.0.0.1:3000/api/generate-plan", {
        method: "POST",
        body: "{not-json",
        headers: {
          "Content-Type": "application/json"
        }
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.ok).toBe(false);
    expect(payload.error).toBe("Request body must be valid JSON.");
  });
});
