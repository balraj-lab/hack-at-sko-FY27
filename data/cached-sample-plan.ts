import type { CareProfile } from "@/lib/schemas/care-profile";
import type { CarePlanSection } from "@/lib/schemas/care-plan";

export function buildCachedSamplePlan(profile: CareProfile): CarePlanSection[] {
  return [
    {
      id: "summary",
      title: "Diagnosis/Profile Summary",
      category: "clinical-prep",
      status: "verify_with_clinician",
      items: [
        {
          text: `${profile.patientName} entered ${profile.diagnosis} with ${profile.tumorSubtype}.`,
          label: "entered by user",
          kind: "context",
          evidenceLevel: "demo_context",
          sourceIds: [],
          requiresClinicianClearance: false
        },
        {
          text: `${profile.stage} should be confirmed with oncology because staging can change after imaging or lymph node evaluation.`,
          label: "confirm",
          kind: "context",
          evidenceLevel: "patient_education",
          sourceIds: ["nci-breast-cancer"],
          requiresClinicianClearance: false
        }
      ],
      citations: ["nci-breast-cancer"],
      warnings: ["Educational summary only. Confirm all medical facts with the oncology team."],
      nextAction: "Bring diagnosis, biopsy/pathology records, imaging orders, and questions to the oncology visit."
    },
    {
      id: "doctor-questions",
      title: "Questions For The Care Team",
      category: "appointment-prep",
      status: "verify_with_clinician",
      items: [
        {
          text: "What stage is confirmed today, and what information is still missing?",
          action: "Ask oncologist",
          kind: "question",
          evidenceLevel: "patient_education",
          sourceIds: ["nci-breast-cancer"],
          requiresClinicianClearance: false
        },
        {
          text: "Do my subtype and age make genetic counseling or genomic testing relevant?",
          action: "Ask oncologist or genetic counselor",
          kind: "question",
          evidenceLevel: "patient_education",
          sourceIds: ["nci-breast-cancer"],
          requiresClinicianClearance: false
        },
        {
          text: "Which side effects are common, which are urgent, and who do I call after hours?",
          action: "Ask care team",
          kind: "question",
          evidenceLevel: "patient_education",
          sourceIds: ["nci-breast-cancer"],
          requiresClinicianClearance: false
        }
      ],
      citations: ["nci-breast-cancer"],
      warnings: ["Questions are prompts for discussion, not treatment recommendations."],
      nextAction: "Save these questions for the first oncology appointment."
    },
    {
      id: "insurance",
      title: "Insurance And Cost Checklist",
      category: "cost-navigation",
      status: "verify_live",
      items: [
        {
          text: `Verify that oncology, surgery, imaging, infusion, and hospital sites are in network for ${profile.insuranceType}.`,
          action: "Call insurer",
          kind: "recommendation",
          evidenceLevel: "navigation_resource",
          sourceIds: ["healthcare-appeals"],
          requiresClinicianClearance: false
        },
        {
          text: "Ask which tests, imaging, second opinions, and specialty medications need prior authorization.",
          action: "Call insurer or clinic financial counselor",
          kind: "question",
          evidenceLevel: "navigation_resource",
          sourceIds: ["healthcare-appeals", "acs-patient-navigation"],
          requiresClinicianClearance: false
        },
        {
          text: "Keep copies of clinician notes, diagnosis codes, orders, and denial letters for possible appeals.",
          action: "Prepare folder",
          kind: "recommendation",
          evidenceLevel: "navigation_resource",
          sourceIds: ["healthcare-appeals"],
          requiresClinicianClearance: false
        }
      ],
      citations: ["healthcare-appeals", "acs-patient-navigation"],
      warnings: ["Network and coverage details must be verified live with the insurer."],
      nextAction: "Call the insurer before scheduling out-of-network services."
    },
    {
      id: "support",
      title: "Support And Navigation",
      category: "support",
      status: "ready",
      items: [
        {
          text: `Ask for a patient navigator or oncology social worker near ZIP ${profile.zipCode}.`,
          action: "Ask clinic",
          kind: "resource",
          evidenceLevel: "navigation_resource",
          sourceIds: ["acs-patient-navigation"],
          requiresClinicianClearance: false
        },
        {
          text: `Prioritize support needs: ${profile.supportNeeds.join(", ")}.`,
          action: "Share with navigator",
          kind: "context",
          evidenceLevel: "demo_context",
          sourceIds: [],
          requiresClinicianClearance: false
        },
        {
          text: "Ask about transportation, financial counseling, therapy, caregiver resources, and bilingual support.",
          action: "Ask navigator",
          kind: "question",
          evidenceLevel: "navigation_resource",
          sourceIds: ["acs-patient-navigation"],
          requiresClinicianClearance: false
        }
      ],
      citations: ["acs-patient-navigation"],
      warnings: [],
      nextAction: "Ask the oncology clinic for navigation and social-work referrals."
    },
    {
      id: "nutrition-exercise",
      title: "Nutrition And Movement Recommendations",
      category: "self-care",
      status: "verify_with_clinician",
      items: [
        {
          text: `Use ${profile.dietBaseline.toLowerCase()} as the starting baseline. Prioritize enough protein and calories to maintain strength, weight, muscle, recovery, and treatment tolerance, especially if appetite or side effects change.`,
          action: "Do now",
          kind: "recommendation",
          evidenceLevel: "patient_education",
          sourceIds: ["acs-nutrition-during-treatment", "nci-nutrition-during-cancer"],
          requiresClinicianClearance: false
        },
        {
          text: "Build meals around vegetables, fruits, whole grains, beans or lentils, and protein sources such as fish, poultry, eggs, low-fat dairy, soy foods, nuts, or nut butters when tolerated.",
          action: "Do now",
          kind: "recommendation",
          evidenceLevel: "clinical_guideline",
          sourceIds: ["acs-survivor-nutrition-activity-guideline"],
          requiresClinicianClearance: false
        },
        {
          text: "Limit red and processed meats, sugar-sweetened drinks, refined grains, highly processed foods, and alcohol; during treatment, ask the oncology team whether alcohol should be avoided because it can interact with some treatments or worsen side effects.",
          action: "Do now",
          kind: "recommendation",
          evidenceLevel: "clinical_guideline",
          sourceIds: ["acs-survivor-nutrition-activity-guideline"],
          requiresClinicianClearance: true
        },
        {
          text: `Given the baseline "${profile.exerciseBaseline}", start with gentle walking or similar moderate activity if already tolerated, then work toward 150-300 minutes per week of moderate activity and 2 strength sessions per week after clearance.`,
          action: "Build toward",
          kind: "recommendation",
          evidenceLevel: "clinical_guideline",
          sourceIds: [
            "acs-survivor-nutrition-activity-guideline",
            "acs-physical-activity-cancer"
          ],
          requiresClinicianClearance: true
        },
        {
          text: "Avoid exercise when dizzy, unsteady, at high fall risk, or when new swelling, pain, dizziness, blurred vision, chest pain, severe shortness of breath, fever, uncontrolled bleeding, or sudden severe symptoms appear.",
          action: "Safety check",
          kind: "safety",
          evidenceLevel: "patient_education",
          sourceIds: ["acs-physical-activity-cancer"],
          requiresClinicianClearance: true
        },
        {
          text: "What restrictions should I follow because of surgery timing, anemia, infection risk, neuropathy, bone pain, heart/lung issues, ports, lymphedema risk, or treatment side effects?",
          action: "Ask care team",
          kind: "question",
          evidenceLevel: "patient_education",
          sourceIds: ["acs-physical-activity-cancer"],
          requiresClinicianClearance: false
        }
      ],
      citations: [
        "acs-survivor-nutrition-activity-guideline",
        "acs-physical-activity-cancer",
        "acs-nutrition-during-treatment",
        "nci-nutrition-during-cancer"
      ],
      warnings: [
        "Nutrition and movement can support strength, symptoms, recovery, and overall health, but they are not cancer treatment.",
        "Exercise targets should be adjusted by the care team for surgery timing, blood counts, infection risk, pain, balance, heart/lung issues, bone concerns, and treatment side effects."
      ],
      nextAction: "Use the recommendations as a starting checklist, then confirm restrictions and referrals with oncology, dietitian, or physical therapy."
    },
    {
      id: "complementary-care",
      title: "Complementary Care Safety",
      category: "safety",
      status: "verify_with_clinician",
      items: [
        {
          text: "Tell the oncology team about supplements, herbs, homeopathic products, vitamins, or over-the-counter medicines before using them.",
          action: "Ask care team",
          kind: "safety",
          evidenceLevel: "patient_education",
          sourceIds: ["nci-breast-cancer"],
          requiresClinicianClearance: true
        },
        {
          text: "Ask the pharmacist about interactions with medications, anesthesia, bleeding risk, liver metabolism, and immune effects.",
          action: "Ask pharmacist",
          kind: "question",
          evidenceLevel: "patient_education",
          sourceIds: ["nci-breast-cancer"],
          requiresClinicianClearance: false
        },
        {
          text: "Do not delay surgery, radiation, chemotherapy, endocrine therapy, or other standard care in favor of unproven treatments.",
          action: "Safety check",
          kind: "safety",
          evidenceLevel: "patient_education",
          sourceIds: ["nci-breast-cancer"],
          requiresClinicianClearance: true
        }
      ],
      citations: ["nci-breast-cancer"],
      warnings: ["This demo avoids outcome guarantees and medication change instructions."],
      nextAction: "Bring all products and supplements to the next oncology visit."
    }
  ];
}
