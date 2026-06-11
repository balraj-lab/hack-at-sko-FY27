import { sourceRegistry } from "@/data/source-registry";
import { carePlanSectionSchema, type CarePlanSection } from "@/lib/schemas/care-plan";
import type { CareProfile } from "@/lib/schemas/care-profile";

const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";

export type ModelAdapterResult =
  | {
      status: "generated";
      sections: CarePlanSection[];
    }
  | {
      status: "disabled" | "skipped" | "failed";
      reason: string;
    };

type FetchLike = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

export interface ModelAdapterOptions {
  fetchImpl?: FetchLike;
}

export async function tryGenerateModelPlan(
  profile: CareProfile,
  options: ModelAdapterOptions = {}
): Promise<ModelAdapterResult> {
  if (!profile.sampleMode) {
    return {
      status: "skipped",
      reason: "Model adapter skipped because sampleMode is false."
    };
  }

  if (process.env.ENABLE_MODEL_ADAPTER !== "true") {
    return {
      status: "disabled",
      reason: "Set ENABLE_MODEL_ADAPTER=true to call the model adapter."
    };
  }

  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL;

  if (!apiKey || !model) {
    return {
      status: "failed",
      reason: "OPENAI_API_KEY and OPENAI_MODEL are required for model adapter generation"
    };
  }

  const fetchImpl = options.fetchImpl ?? fetch;
  const response = await fetchImpl(OPENAI_RESPONSES_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: "system",
          content:
            "You create sample-only health navigation plans. Return only JSON. Never provide diagnosis, treatment selection, cure claims, medication start/stop instructions, or emergency triage. Use only the provided source ids."
        },
        {
          role: "user",
          content: JSON.stringify({
            task:
              "Return an array of care plan sections matching the provided TypeScript shape. Keep all recommendations educational, source-backed, and clinician-verification oriented.",
            sectionShape: {
              id: "string",
              title: "string",
              category: "string",
              status: "ready | missing_information | verify_with_clinician | verify_live",
              items: [
                {
                  text: "string",
                  action: "string optional",
                  label: "string optional",
                  kind: "recommendation | question | safety | resource | context",
                  evidenceLevel:
                    "clinical_guideline | patient_education | navigation_resource | demo_context",
                  sourceIds: ["source id strings"],
                  requiresClinicianClearance: true
                }
              ],
              citations: ["source id strings"],
              warnings: ["string"],
              nextAction: "string"
            },
            profile,
            sources: sourceRegistry.map((source) => ({
              id: source.id,
              organization: source.organization,
              title: source.title,
              summary: source.summary,
              allowedSections: source.allowedSections
            }))
          })
        }
      ]
    })
  });

  if (!response.ok) {
    return {
      status: "failed",
      reason: `model adapter returned ${response.status}`
    };
  }

  const payload = await response.json();
  const text = extractResponseText(payload);

  if (!text) {
    return {
      status: "failed",
      reason: "model adapter returned no text"
    };
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(text);
  } catch {
    return {
      status: "failed",
      reason: "model adapter returned invalid JSON"
    };
  }

  const sections = carePlanSectionSchema.array().safeParse(parsed);

  if (!sections.success) {
    return {
      status: "failed",
      reason: "model adapter JSON did not match care plan schema"
    };
  }

  const allowedSourceIds = new Set(sourceRegistry.map((source) => source.id));
  const unknownSourceId = sections.data
    .flatMap((section) => [
      ...section.citations,
      ...section.items.flatMap((item) => item.sourceIds)
    ])
    .find((sourceId) => !allowedSourceIds.has(sourceId));

  if (unknownSourceId) {
    return {
      status: "failed",
      reason: `model adapter referenced unknown source id ${unknownSourceId}`
    };
  }

  return {
    status: "generated",
    sections: sections.data
  };
}

export function extractResponseText(payload: unknown): string | null {
  if (typeof payload !== "object" || payload === null) {
    return null;
  }

  if ("output_text" in payload && typeof payload.output_text === "string") {
    return payload.output_text;
  }

  const output = "output" in payload && Array.isArray(payload.output) ? payload.output : [];

  for (const item of output) {
    if (typeof item !== "object" || item === null || !("content" in item)) {
      continue;
    }

    const content = Array.isArray(item.content) ? item.content : [];

    for (const contentItem of content) {
      if (
        typeof contentItem === "object" &&
        contentItem !== null &&
        "text" in contentItem &&
        typeof contentItem.text === "string"
      ) {
        return contentItem.text;
      }
    }
  }

  return null;
}
