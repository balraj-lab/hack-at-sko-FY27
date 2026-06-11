import { afterEach, describe, expect, it } from "bun:test";
import { buildCachedSamplePlan } from "@/data/cached-sample-plan";
import { sampleCareProfile } from "@/data/sample-profile";
import { extractResponseText, tryGenerateModelPlan } from "@/lib/ai/model-adapter";

const originalEnv = {
  ENABLE_MODEL_ADAPTER: process.env.ENABLE_MODEL_ADAPTER,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  OPENAI_MODEL: process.env.OPENAI_MODEL
};

afterEach(() => {
  restoreEnv("ENABLE_MODEL_ADAPTER", originalEnv.ENABLE_MODEL_ADAPTER);
  restoreEnv("OPENAI_API_KEY", originalEnv.OPENAI_API_KEY);
  restoreEnv("OPENAI_MODEL", originalEnv.OPENAI_MODEL);
});

describe("extractResponseText", () => {
  it("reads output_text from Responses API payloads", () => {
    expect(extractResponseText({ output_text: "[1]" })).toBe("[1]");
  });

  it("reads nested content text from Responses API payloads", () => {
    expect(
      extractResponseText({
        output: [
          {
            content: [
              {
                text: "[]"
              }
            ]
          }
        ]
      })
    ).toBe("[]");
  });
});

describe("tryGenerateModelPlan", () => {
  it("stays disabled unless explicitly enabled", async () => {
    delete process.env.ENABLE_MODEL_ADAPTER;

    const result = await tryGenerateModelPlan(sampleCareProfile);

    expect(result.status).toBe("disabled");
  });

  it("skips live generation when sampleMode is false", async () => {
    process.env.ENABLE_MODEL_ADAPTER = "true";

    const result = await tryGenerateModelPlan({
      ...sampleCareProfile,
      sampleMode: false
    });

    expect(result.status).toBe("skipped");
  });

  it("accepts typed model sections from the configured adapter", async () => {
    process.env.ENABLE_MODEL_ADAPTER = "true";
    process.env.OPENAI_API_KEY = "test-key";
    process.env.OPENAI_MODEL = "test-model";

    const sections = buildCachedSamplePlan(sampleCareProfile);
    const result = await tryGenerateModelPlan(sampleCareProfile, {
      fetchImpl: async () =>
        new Response(
          JSON.stringify({
            output_text: JSON.stringify(sections)
          }),
          { status: 200 }
        )
    });

    expect(result.status).toBe("generated");
    if (result.status !== "generated") {
      throw new Error("expected generated result");
    }

    expect(result.sections.length).toBeGreaterThan(0);
  });

  it("rejects model sections that cite unknown sources", async () => {
    process.env.ENABLE_MODEL_ADAPTER = "true";
    process.env.OPENAI_API_KEY = "test-key";
    process.env.OPENAI_MODEL = "test-model";

    const sections = buildCachedSamplePlan(sampleCareProfile);
    const result = await tryGenerateModelPlan(sampleCareProfile, {
      fetchImpl: async () =>
        new Response(
          JSON.stringify({
            output_text: JSON.stringify([
              {
                ...sections[0],
                citations: ["unknown-source"]
              }
            ])
          }),
          { status: 200 }
        )
    });

    expect(result.status).toBe("failed");
  });
});

function restoreEnv(key: string, value: string | undefined) {
  if (value === undefined) {
    delete process.env[key];
    return;
  }

  process.env[key] = value;
}
