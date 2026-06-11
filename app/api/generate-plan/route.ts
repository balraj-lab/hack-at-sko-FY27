import { NextResponse } from "next/server";
import { generatePlanService } from "@/lib/plan/generate-plan-service";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: "Request body must be valid JSON.",
        reasons: ["Send a structured synthetic care profile."]
      },
      { status: 400 }
    );
  }

  const response = await generatePlanService(body);

  if (!response.ok) {
    return NextResponse.json(response, { status: response.status });
  }

  return NextResponse.json(response);
}
