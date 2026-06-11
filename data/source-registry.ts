import type { SourceCard } from "@/lib/schemas/source-card";

export const sourceRegistry: SourceCard[] = [
  {
    id: "nci-breast-cancer",
    title: "Breast Cancer",
    organization: "National Cancer Institute",
    url: "https://www.cancer.gov/types/breast",
    retrievedAt: "2026-06-11",
    tags: ["breast-cancer", "treatment", "patient-education"],
    summary:
      "Patient-facing overview of breast cancer diagnosis, treatment, research, and support information.",
    allowedSections: ["summary", "questions", "evidence", "trials"]
  },
  {
    id: "acs-patient-navigation",
    title: "Patient Navigation",
    organization: "American Cancer Society",
    url: "https://www.cancer.org/cancer/patient-navigation.html",
    retrievedAt: "2026-06-11",
    tags: ["navigation", "support", "resources"],
    summary:
      "Explains patient navigation support for care coordination, barriers, resources, and cancer support.",
    allowedSections: ["support", "next-steps", "insurance"]
  },
  {
    id: "healthcare-appeals",
    title: "Appeal a Health Insurance Company Decision",
    organization: "HealthCare.gov",
    url: "https://www.healthcare.gov/appeal-insurance-company-decision/",
    retrievedAt: "2026-06-11",
    tags: ["insurance", "appeals", "coverage"],
    summary:
      "Patient-facing information about internal appeals and external review for denied claims.",
    allowedSections: ["insurance"]
  },
  {
    id: "acs-survivor-nutrition-activity-guideline",
    title: "American Cancer Society Guideline for Diet and Physical Activity for Cancer Survivors",
    organization: "American Cancer Society",
    url: "https://www.cancer.org/cancer/supportive-care/nutrition-activity-with-cancer/acs-nutrition-and-physical-activity-guideline-for-survivors.html",
    retrievedAt: "2026-06-11",
    tags: ["nutrition", "physical-activity", "survivorship", "guideline"],
    summary:
      "Guideline-backed recommendations for diet, physical activity, weight, and alcohol during and after cancer care.",
    allowedSections: ["nutrition", "exercise", "self-care"]
  },
  {
    id: "acs-physical-activity-cancer",
    title: "Physical Activity When You Have Cancer",
    organization: "American Cancer Society",
    url: "https://www.cancer.org/cancer/supportive-care/nutrition-activity-with-cancer/physical-activity-when-you-have-cancer.html",
    retrievedAt: "2026-06-11",
    tags: ["physical-activity", "exercise-safety", "supportive-care"],
    summary:
      "Patient guidance on starting slowly, staying active safely, avoiding fall risk, and checking with clinicians when symptoms or risks are present.",
    allowedSections: ["exercise", "safety", "self-care"]
  },
  {
    id: "acs-nutrition-during-treatment",
    title: "Benefits of Good Nutrition During Cancer Treatment",
    organization: "American Cancer Society",
    url: "https://www.cancer.org/cancer/supportive-care/nutrition-activity-with-cancer/benefits.html",
    retrievedAt: "2026-06-11",
    tags: ["nutrition", "protein", "treatment-support"],
    summary:
      "Explains nutrition needs during cancer treatment, including protein for tissue repair, immune support, and recovery.",
    allowedSections: ["nutrition", "self-care"]
  },
  {
    id: "nci-nutrition-during-cancer",
    title: "Nutrition During Cancer",
    organization: "National Cancer Institute",
    url: "https://www.cancer.gov/about-cancer/treatment/side-effects/nutrition",
    retrievedAt: "2026-06-11",
    tags: ["nutrition", "appetite", "side-effects", "patient-education"],
    summary:
      "Patient education on nutrition during cancer treatment, including high-protein, high-calorie strategies and small frequent meals when appetite is low.",
    allowedSections: ["nutrition", "self-care"]
  }
];
