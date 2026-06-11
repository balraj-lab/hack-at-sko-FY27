import { sourceRegistry } from "@/data/source-registry";
import type { CarePlanSection } from "@/lib/schemas/care-plan";
import type { SourceCard } from "@/lib/schemas/source-card";

export function attachSourcesToPlan(sections: CarePlanSection[]): SourceCard[] {
  const requiredIds = new Set(
    sections.flatMap((section) => [
      ...section.citations,
      ...section.items.flatMap((item) => item.sourceIds)
    ])
  );

  return sourceRegistry.filter((source) => requiredIds.has(source.id));
}

export function getSourceById(id: string): SourceCard | undefined {
  return sourceRegistry.find((source) => source.id === id);
}
