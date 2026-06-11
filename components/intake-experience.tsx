"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { sampleCareProfile } from "@/data/sample-profile";
import type { GeneratePlanResult } from "@/lib/ai/generate-plan";
import {
  parseListInput,
  serializeListInput,
  validateCareProfile,
  type CareProfile
} from "@/lib/schemas/care-profile";
import { evaluatePhiGuard } from "@/lib/privacy/phi-guard";

type DraftProfile = Omit<CareProfile, "age"> & {
  age: string;
};

type PacketView = "overview" | "appointment" | "details";

const emptyDraft: DraftProfile = {
  patientName: "",
  diagnosis: "",
  tumorSubtype: "",
  stage: "",
  age: "",
  zipCode: "",
  insuranceType: "",
  preferredLanguage: "",
  careStatus: "",
  careGoals: [],
  constraints: [],
  medications: [],
  allergies: [],
  dietBaseline: "",
  exerciseBaseline: "",
  supportNeeds: [],
  topConcerns: [],
  sampleMode: true
};

function toDraft(profile: CareProfile): DraftProfile {
  return {
    ...profile,
    age: String(profile.age)
  };
}

function toProfile(draft: DraftProfile): CareProfile {
  return {
    ...draft,
    age: Number(draft.age)
  };
}

export function IntakeExperience() {
  const [draft, setDraft] = useState<DraftProfile>(emptyDraft);
  const [touched, setTouched] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string[]>([]);
  const [generatedPlan, setGeneratedPlan] = useState<GeneratePlanResult | null>(null);

  const parsedProfile = useMemo(() => validateCareProfile(toProfile(draft)), [draft]);
  const phiGuard = parsedProfile.success
    ? evaluatePhiGuard(parsedProfile.data)
    : { allowed: false, reasons: [] };

  const errors = parsedProfile.success
    ? []
    : parsedProfile.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`);
  const generatedSummary = generatedPlan
    ? {
        questions: generatedPlan.sections
          .flatMap((section) => section.items)
          .filter((item) => item.kind === "question").length,
        sections: generatedPlan.sections.length,
        sources: generatedPlan.sources.length
      }
    : null;

  useEffect(() => {
    if (!generatedPlan) {
      return;
    }

    const scrollTimer = window.setTimeout(() => {
      document.getElementById("care-packet")?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }, 150);

    return () => window.clearTimeout(scrollTimer);
  }, [generatedPlan]);

  function updateField<K extends keyof DraftProfile>(key: K, value: DraftProfile[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
    setTouched(true);
    setGeneratedPlan(null);
    setGenerationError([]);
  }

  function updateListField(key: keyof DraftProfile, value: string) {
    updateField(key, parseListInput(value) as DraftProfile[keyof DraftProfile]);
  }

  async function requestPlan(profile: CareProfile) {
    setIsGenerating(true);
    setGenerationError([]);
    setGeneratedPlan(null);

    try {
      const response = await fetch("/api/generate-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(profile)
      });
      const payload = await response.json();

      if (!response.ok || !payload.ok) {
        setGenerationError(payload.reasons ?? [payload.error ?? "Plan generation failed."]);
        return false;
      }

      setGeneratedPlan(payload.result);
      return true;
    } catch {
      setGenerationError(["Could not reach the plan generation endpoint."]);
      return false;
    } finally {
      setIsGenerating(false);
    }
  }

  async function generatePlan() {
    if (!parsedProfile.success || !phiGuard.allowed) {
      setGenerationError(["Fix validation and synthetic-data guard warnings first."]);
      return;
    }

    await requestPlan(parsedProfile.data);
  }

  return (
    <>
      <section className="panel intake-panel" aria-labelledby="intake-heading">
        <div className="intake-header">
          <div>
            <h2 id="intake-heading" className="section-title">
              Structured intake
            </h2>
            <p className="section-copy">
              Load Maria's synthetic profile or enter sample-only values, then generate
              a care-navigation packet.
            </p>
          </div>
          <div className="tag-row intake-tags">
            <span className="tag">Synthetic sample mode</span>
            <span className="tag warning-tag">Sample-guarded adapter</span>
          </div>
        </div>

        <div className="actions intake-actions">
          <button
            className="secondary"
            type="button"
            onClick={() => {
              setDraft(toDraft(sampleCareProfile));
              setTouched(true);
              setGeneratedPlan(null);
              setGenerationError([]);
            }}
          >
            Load sample profile
          </button>
          <button
            className="secondary"
            type="button"
            onClick={() => {
              setDraft(emptyDraft);
              setTouched(false);
              setGeneratedPlan(null);
              setGenerationError([]);
            }}
          >
            Clear
          </button>
          <button
            className="primary"
            type="button"
            disabled={!parsedProfile.success || !phiGuard.allowed || isGenerating}
            onClick={generatePlan}
          >
            {isGenerating ? "Generating..." : "Generate plan"}
          </button>
        </div>

        {touched && errors.length > 0 ? (
          <ul className="error-list" aria-label="Validation errors">
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        ) : null}

        {touched && phiGuard.reasons.length > 0 ? (
          <ul className="error-list" aria-label="PHI guard warnings">
            {phiGuard.reasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        ) : null}

        {generationError.length > 0 ? (
          <ul className="error-list" aria-label="Generation errors">
            {generationError.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        ) : null}

        {generatedSummary ? (
          <div className="success-banner" role="status">
            <div>
              <strong>Packet ready</strong>
              <span>appointment handoff</span>
            </div>
            <span>{generatedSummary.sections} sections</span>
            <span>{generatedSummary.questions} provider questions</span>
            <span>{generatedSummary.sources} trusted sources</span>
          </div>
        ) : null}

        <div className="form-grid" style={{ marginTop: 16 }}>
          <TextField
            label="Patient name"
            value={draft.patientName}
            onChange={(value) => updateField("patientName", value)}
          />
          <TextField
            label="Age"
            value={draft.age}
            inputMode="numeric"
            onChange={(value) => updateField("age", value)}
          />
          <TextField
            label="Diagnosis"
            value={draft.diagnosis}
            onChange={(value) => updateField("diagnosis", value)}
          />
          <TextField
            label="Stage"
            value={draft.stage}
            onChange={(value) => updateField("stage", value)}
          />
          <TextField
            label="Tumor subtype"
            value={draft.tumorSubtype}
            onChange={(value) => updateField("tumorSubtype", value)}
            full
          />
          <TextField
            label="ZIP code"
            value={draft.zipCode}
            onChange={(value) => updateField("zipCode", value)}
          />
          <TextField
            label="Insurance"
            value={draft.insuranceType}
            onChange={(value) => updateField("insuranceType", value)}
          />
          <TextField
            label="Preferred language"
            value={draft.preferredLanguage}
            onChange={(value) => updateField("preferredLanguage", value)}
          />
          <TextField
            label="Care status"
            value={draft.careStatus}
            onChange={(value) => updateField("careStatus", value)}
          />
          <TextareaField
            label="Care goals"
            value={serializeListInput(draft.careGoals)}
            onChange={(value) => updateListField("careGoals", value)}
          />
          <TextareaField
            label="Constraints"
            value={serializeListInput(draft.constraints)}
            onChange={(value) => updateListField("constraints", value)}
          />
          <TextareaField
            label="Medications"
            value={serializeListInput(draft.medications)}
            onChange={(value) => updateListField("medications", value)}
          />
          <TextareaField
            label="Allergies"
            value={serializeListInput(draft.allergies)}
            onChange={(value) => updateListField("allergies", value)}
          />
          <TextareaField
            label="Diet baseline"
            value={draft.dietBaseline}
            onChange={(value) => updateField("dietBaseline", value)}
          />
          <TextareaField
            label="Exercise baseline"
            value={draft.exerciseBaseline}
            onChange={(value) => updateField("exerciseBaseline", value)}
          />
          <TextareaField
            label="Support needs"
            value={serializeListInput(draft.supportNeeds)}
            onChange={(value) => updateListField("supportNeeds", value)}
          />
          <TextareaField
            label="Top concerns"
            value={serializeListInput(draft.topConcerns)}
            onChange={(value) => updateListField("topConcerns", value)}
          />
        </div>
      </section>

      {generatedPlan && parsedProfile.success ? (
        <PlanPreview plan={generatedPlan} profile={parsedProfile.data} />
      ) : null}
    </>
  );
}

function PlanPreview({ plan, profile }: { plan: GeneratePlanResult; profile: CareProfile }) {
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">("idle");
  const [activeView, setActiveView] = useState<PacketView>("overview");
  const sourceMap = new Map(plan.sources.map((source) => [source.id, source]));
  const itemsWithContext = plan.sections.flatMap((section) =>
    section.items.map((item) => ({
      ...item,
      sectionId: section.id,
      sectionTitle: section.title,
      sectionStatus: section.status
    }))
  );
  const prioritySteps = [
    {
      timeframe: "First 24 hours",
      title: "Create the visit packet",
      detail:
        findSection(plan, "summary")?.nextAction ??
        "Gather diagnosis, imaging, medication, allergy, and insurance details.",
      status: "verify_with_clinician"
    },
    {
      timeframe: "Before scheduling",
      title: "Prevent avoidable cost surprises",
      detail:
        findSection(plan, "insurance")?.nextAction ??
        "Confirm network status and prior authorization requirements before visits or tests.",
      status: "verify_live"
    },
    {
      timeframe: "This week",
      title: "Get a navigator in the loop",
      detail:
        findSection(plan, "support")?.nextAction ??
        "Ask the oncology clinic for patient navigation and social-work support.",
      status: "ready"
    },
    {
      timeframe: "Daily baseline",
      title: "Start supportive nutrition and movement",
      detail:
        findSection(plan, "nutrition-exercise")?.nextAction ??
        "Use evidence-backed supportive-care basics while confirming restrictions.",
      status: "verify_with_clinician"
    }
  ];
  const doNowItems = itemsWithContext
    .filter((item) => item.kind === "recommendation")
    .slice(0, 5);
  const questionItems = itemsWithContext
    .filter((item) => item.kind === "question")
    .slice(0, 6);
  const safetyItems = itemsWithContext
    .filter((item) => item.kind === "safety" || item.requiresClinicianClearance)
    .slice(0, 5);
  const insuranceItems = itemsWithContext
    .filter((item) => item.sectionId === "insurance")
    .slice(0, 4);
  const supportItems = itemsWithContext
    .filter((item) => item.sectionId === "support")
    .slice(0, 3);

  async function copyAppointmentPacket() {
    try {
      await navigator.clipboard.writeText(
        buildAppointmentPacketText({
          profile,
          plan,
          prioritySteps,
          questionItems,
          insuranceItems,
          doNowItems,
          safetyItems,
          supportItems
        })
      );
      setCopyStatus("copied");
    } catch {
      setCopyStatus("failed");
    }
  }

  return (
    <section className="plan-preview" id="care-packet" aria-label="Generated care plan packet">
      <div className="outcome-hero">
        <div>
          <p className="eyebrow">Care packet ready</p>
          <h2>{profile.patientName}'s next-step packet</h2>
          <p>
            {profile.age} years old, {profile.diagnosis.toLowerCase()}, {profile.tumorSubtype};
            stage entered as {profile.stage}. ZIP {profile.zipCode}, {profile.insuranceType}.
          </p>
        </div>
        <div className="metric-grid" aria-label="Plan quality signals">
          <MetricCard label="Sections" value={String(plan.sections.length)} />
          <MetricCard label="Sources" value={String(plan.sources.length)} />
        </div>
      </div>

      <div className="view-tabs no-print" aria-label="Care packet views">
        {(["overview", "appointment", "details"] as PacketView[]).map((view) => (
          <button
            aria-pressed={activeView === view}
            className={activeView === view ? "tab-button active" : "tab-button"}
            key={view}
            onClick={() => setActiveView(view)}
            type="button"
          >
            {view === "overview"
              ? "Overview"
              : view === "appointment"
                ? "Appointment packet"
                : "Evidence details"}
          </button>
        ))}
      </div>

      {activeView === "overview" ? (
        <section className="overview-panel" aria-labelledby="overview-heading">
          <div className="start-card">
            <div>
              <p className="eyebrow">Start here</p>
              <h3 id="overview-heading">{prioritySteps[0].title}</h3>
              <p>{prioritySteps[0].detail}</p>
            </div>
            <div className="start-actions">
              <button className="primary" type="button" onClick={() => setActiveView("appointment")}>
                Take to appointment
              </button>
              <button className="secondary" type="button" onClick={() => setActiveView("details")}>
                View evidence
              </button>
            </div>
          </div>

          <div className="overview-grid">
            <SummaryList
              items={prioritySteps.map((step) => `${step.timeframe}: ${step.title}`)}
              title="Next 72 hours"
            />
            <SummaryList
              items={questionItems.slice(0, 4).map((item) => item.text)}
              title="Questions to ask"
            />
            <SummaryList
              items={doNowItems.slice(0, 4).map((item) => item.text)}
              title="Supportive care"
            />
            <SummaryList
              items={safetyItems.slice(0, 4).map((item) => item.text)}
              title="Verify first"
              tone="warning"
            />
          </div>
        </section>
      ) : null}

      {activeView === "appointment" ? (
        <AppointmentPacket
          copyStatus={copyStatus}
          doNowItems={doNowItems}
          insuranceItems={insuranceItems}
          onCopy={copyAppointmentPacket}
          onPrint={() => window.print()}
          plan={plan}
          prioritySteps={prioritySteps}
          profile={profile}
          questionItems={questionItems}
          safetyItems={safetyItems}
          sourceMap={sourceMap}
          supportItems={supportItems}
        />
      ) : null}

      {activeView === "details" ? (
        <section className="details-panel" aria-labelledby="details-heading">
          <div className="plan-heading">
            <div>
              <p className="eyebrow">Evidence details</p>
              <h2 id="details-heading">All generated sections</h2>
            </div>
            <span className="status-pill">
              Generated {new Date(plan.generatedAt).toLocaleTimeString()}
            </span>
          </div>

          <div className="tag-row">
            <span className={plan.safety.allowed ? "tag" : "tag warning-tag"}>
              {plan.safety.allowed ? "Safety pass clear" : "Safety findings"}
            </span>
          </div>

          {plan.warnings.length > 0 ? (
            <ul className="warning-list">
              {plan.warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          ) : null}

          {plan.sections.map((section) => (
            <details className="plan-section" key={section.id}>
              <summary>
                <span>{section.title}</span>
                <span className="tag warning-tag">{formatStatus(section.status)}</span>
              </summary>
              <div className="section-body">
                <p className="section-copy">{section.nextAction}</p>
                <div className="action-card-list compact-list">
                  {section.items.map((item) => (
                    <ActionCard
                      item={{
                        ...item,
                        sectionId: section.id,
                        sectionTitle: section.title,
                        sectionStatus: section.status
                      }}
                      sourceMap={sourceMap}
                      key={`${section.id}-${item.text}`}
                    />
                  ))}
                </div>
                {section.warnings.length > 0 ? (
                  <div className="warning compact">
                    {section.warnings.map((warning) => (
                      <p key={warning}>{warning}</p>
                    ))}
                  </div>
                ) : null}
                <div className="tag-row">
                  {section.citations.map((citationId) => {
                    const source = sourceMap.get(citationId);

                    return (
                      <span className="tag" key={citationId}>
                        {source ? `${source.organization}: ${source.title}` : citationId}
                      </span>
                    );
                  })}
                </div>
              </div>
            </details>
          ))}

          <div className="source-panel">
            <div className="plan-heading">
              <div>
                <p className="eyebrow">Evidence registry</p>
                <h3>Attached sources</h3>
              </div>
            </div>
            <div className="source-grid">
              {plan.sources.map((source) => (
                <a
                  className="source-card"
                  href={source.url}
                  key={source.id}
                  rel="noreferrer"
                  target="_blank"
                >
                  <strong>{source.organization}</strong>
                  <span>{source.title}</span>
                  <p>{source.summary}</p>
                  <small>Retrieved {source.retrievedAt}</small>
                </a>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </section>
  );
}

function SummaryList({
  items,
  title,
  tone = "default"
}: {
  items: string[];
  title: string;
  tone?: "default" | "warning";
}) {
  return (
    <article className={tone === "warning" ? "summary-list warning-summary" : "summary-list"}>
      <h3>{title}</h3>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </article>
  );
}

type ActionItem = GeneratePlanResult["sections"][number]["items"][number] & {
  sectionId: string;
  sectionTitle: string;
  sectionStatus: string;
};

type PriorityStep = {
  timeframe: string;
  title: string;
  detail: string;
  status: string;
};

function AppointmentPacket({
  copyStatus,
  doNowItems,
  insuranceItems,
  onCopy,
  onPrint,
  plan,
  prioritySteps,
  profile,
  questionItems,
  safetyItems,
  sourceMap,
  supportItems
}: {
  copyStatus: "idle" | "copied" | "failed";
  doNowItems: ActionItem[];
  insuranceItems: ActionItem[];
  onCopy: () => void;
  onPrint: () => void;
  plan: GeneratePlanResult;
  prioritySteps: PriorityStep[];
  profile: CareProfile;
  questionItems: ActionItem[];
  safetyItems: ActionItem[];
  sourceMap: Map<string, GeneratePlanResult["sources"][number]>;
  supportItems: ActionItem[];
}) {
  return (
    <section className="appointment-export" aria-labelledby="appointment-packet-heading">
      <div className="export-toolbar no-print">
        <div>
          <p className="eyebrow">Export</p>
          <h3 id="appointment-packet-heading">Take this to your appointment</h3>
        </div>
        <div className="actions export-actions">
          <button className="primary" type="button" onClick={onPrint}>
            Print / Save PDF
          </button>
          <button className="secondary" type="button" onClick={onCopy}>
            {copyStatus === "copied"
              ? "Copied"
              : copyStatus === "failed"
                ? "Copy failed"
                : "Copy packet text"}
          </button>
        </div>
      </div>

      <article className="appointment-packet">
        <header className="print-header">
          <div>
            <p className="eyebrow">Appointment packet</p>
            <h2>{profile.patientName}</h2>
            <p>
              Synthetic demo profile. Educational navigation support only. Confirm all
              diagnosis, treatment, nutrition, exercise, and insurance decisions with
              the care team or insurer.
            </p>
          </div>
          <div className="print-meta">
            <span>Generated {new Date(plan.generatedAt).toLocaleDateString()}</span>
            <span>{plan.sections.length} sections</span>
            <span>{plan.sources.length} sources</span>
          </div>
        </header>

        <div className="packet-snapshot">
          <SnapshotItem label="Diagnosis" value={profile.diagnosis} />
          <SnapshotItem label="Subtype" value={profile.tumorSubtype} />
          <SnapshotItem label="Stage" value={profile.stage} />
          <SnapshotItem label="Insurance" value={profile.insuranceType} />
          <SnapshotItem label="ZIP" value={profile.zipCode} />
          <SnapshotItem label="Care goals" value={serializeListInput(profile.careGoals)} />
        </div>

        <PacketSection title="Priority path">
          <ol className="packet-list">
            {prioritySteps.map((step) => (
              <li key={step.timeframe}>
                <strong>{step.timeframe}: {step.title}</strong>
                <p>{step.detail}</p>
              </li>
            ))}
          </ol>
        </PacketSection>

        <PacketSection title="Top questions for the care team">
          <ol className="packet-list">
            {questionItems.slice(0, 5).map((item) => (
              <li key={`question-${item.text}`}>{item.text}</li>
            ))}
          </ol>
        </PacketSection>

        <div className="packet-two-column">
          <PacketSection title="Insurance and cost checklist">
            <ul className="packet-list">
              {insuranceItems.map((item) => (
                <li key={`insurance-${item.text}`}>{item.text}</li>
              ))}
            </ul>
          </PacketSection>

          <PacketSection title="Support requests">
            <ul className="packet-list">
              {supportItems.map((item) => (
                <li key={`support-${item.text}`}>{item.text}</li>
              ))}
            </ul>
          </PacketSection>
        </div>

        <PacketSection title="Nutrition and movement starter guidance">
          <ul className="packet-list">
            {doNowItems
              .filter((item) => item.sectionId === "nutrition-exercise")
              .map((item) => (
                <li key={`nutrition-${item.text}`}>
                  {item.text}
                  {item.requiresClinicianClearance ? (
                    <strong> Confirm restrictions with the care team.</strong>
                  ) : null}
                </li>
              ))}
          </ul>
        </PacketSection>

        <PacketSection title="Safety and clearance notes">
          <ul className="packet-list">
            {safetyItems.map((item) => (
              <li key={`safety-${item.text}`}>{item.text}</li>
            ))}
          </ul>
        </PacketSection>

        <PacketSection title="Sources attached">
          <ul className="packet-source-list">
            {plan.sources.map((source) => (
              <li key={source.id}>
                <strong>{source.organization}</strong>: {source.title}
                <span>{source.url}</span>
              </li>
            ))}
          </ul>
        </PacketSection>

        <footer className="print-footer">
          <span>Safety pass: {plan.safety.allowed ? "clear" : "review required"}</span>
          <span>Sample-only demo. No real PHI.</span>
          <span>
            Source coverage:{" "}
            {Array.from(sourceMap.keys()).length === plan.sources.length ? "attached" : "review"}
          </span>
        </footer>
      </article>
    </section>
  );
}

function PacketSection({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section className="packet-section">
      <h3>{title}</h3>
      {children}
    </section>
  );
}

function SnapshotItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="snapshot-item">
      <span>{label}</span>
      <strong>{value || "Not entered"}</strong>
    </div>
  );
}

function buildAppointmentPacketText({
  doNowItems,
  insuranceItems,
  plan,
  prioritySteps,
  profile,
  questionItems,
  safetyItems,
  supportItems
}: {
  doNowItems: ActionItem[];
  insuranceItems: ActionItem[];
  plan: GeneratePlanResult;
  prioritySteps: PriorityStep[];
  profile: CareProfile;
  questionItems: ActionItem[];
  safetyItems: ActionItem[];
  supportItems: ActionItem[];
}) {
  const nutritionItems = doNowItems.filter((item) => item.sectionId === "nutrition-exercise");

  return [
    `Appointment packet for ${profile.patientName}`,
    "Synthetic demo profile. Educational navigation support only.",
    "",
    "Profile",
    `- Diagnosis: ${profile.diagnosis}`,
    `- Tumor subtype: ${profile.tumorSubtype}`,
    `- Stage: ${profile.stage}`,
    `- Insurance: ${profile.insuranceType}`,
    `- ZIP: ${profile.zipCode}`,
    `- Care goals: ${serializeListInput(profile.careGoals)}`,
    "",
    "Priority path",
    ...prioritySteps.map((step, index) => `${index + 1}. ${step.timeframe}: ${step.title} - ${step.detail}`),
    "",
    "Top questions for the care team",
    ...questionItems.slice(0, 5).map((item, index) => `${index + 1}. ${item.text}`),
    "",
    "Insurance and cost checklist",
    ...insuranceItems.map((item) => `- ${item.text}`),
    "",
    "Support requests",
    ...supportItems.map((item) => `- ${item.text}`),
    "",
    "Nutrition and movement starter guidance",
    ...nutritionItems.map((item) =>
      `- ${item.text}${item.requiresClinicianClearance ? " Confirm restrictions with the care team." : ""}`
    ),
    "",
    "Safety and clearance notes",
    ...safetyItems.map((item) => `- ${item.text}`),
    "",
    "Sources attached",
    ...plan.sources.map((source) => `- ${source.organization}: ${source.title} (${source.url})`),
    "",
    `Safety pass: ${plan.safety.allowed ? "clear" : "review required"}`,
    "Sample-only demo. No real PHI."
  ].join("\n");
}

function ActionCard({
  item,
  sourceMap
}: {
  item: ActionItem;
  sourceMap: Map<string, GeneratePlanResult["sources"][number]>;
}) {
  return (
    <article className={`action-card ${item.kind === "safety" ? "safety-card" : ""}`}>
      <div className="plan-item-heading">
        <strong>{item.action ?? item.label ?? "Next"}</strong>
        <span className={`tag ${item.kind === "safety" ? "warning-tag" : ""}`}>
          {formatStatus(item.kind)}
        </span>
        {item.evidenceLevel ? <span className="tag">{formatStatus(item.evidenceLevel)}</span> : null}
        {item.requiresClinicianClearance ? (
          <span className="tag warning-tag">verify clearance</span>
        ) : null}
      </div>
      <p>{item.text}</p>
      <div className="action-card-footer">
        <span>{item.sectionTitle}</span>
        <span>{formatStatus(item.sectionStatus)}</span>
      </div>
      {item.sourceIds.length > 0 ? (
        <div className="tag-row">
          {item.sourceIds.map((sourceId) => {
            const source = sourceMap.get(sourceId);

            if (!source) {
              return (
                <span className="tag source-tag" key={`${item.sectionId}-${sourceId}`}>
                  {sourceId}
                </span>
              );
            }

            return (
              <a
                className="tag source-tag"
                href={source.url}
                key={`${item.sectionId}-${sourceId}`}
                rel="noreferrer"
                target="_blank"
              >
                {source.organization}
              </a>
            );
          })}
        </div>
      ) : null}
    </article>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function findSection(plan: GeneratePlanResult, id: string) {
  return plan.sections.find((section) => section.id === id);
}

function TextField({
  label,
  value,
  onChange,
  inputMode,
  full = false
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  inputMode?: "numeric";
  full?: boolean;
}) {
  return (
    <div className={full ? "field full" : "field"}>
      <label>{label}</label>
      <input
        inputMode={inputMode}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

function TextareaField({
  label,
  value,
  onChange
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="field">
      <label>{label}</label>
      <textarea value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}

function formatStatus(status: string): string {
  return status.replaceAll("_", " ");
}
