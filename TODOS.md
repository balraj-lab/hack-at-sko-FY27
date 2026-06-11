# TODOs

## Production HIPAA Readiness

- **What:** Add a production HIPAA readiness workstream before accepting real patient data.
- **Why:** The hackathon app is synthetic-data-only. Real diagnosis/profile data tied to an identifiable person requires a HIPAA production path before use.
- **Pros:** Keeps the demo honest, prevents accidental PHI collection, and gives the next version a clear compliance gate.
- **Cons:** Requires legal/vendor/process work beyond the hackathon build.
- **Context:** Production readiness must include HIPAA-eligible hosting and model vendors, signed BAAs where required, risk analysis, authentication, role-based access controls, audit logs, encryption, retention/deletion controls, consent language, incident response, and breach notification workflow. The hackathon build should block or warn against real patient data until this is complete.
- **Depends on / blocked by:** Vendor selection, BAA availability, deployment target, production data-retention policy, and legal/compliance review.

## Live ClinicalTrials.gov Integration

- **What:** Add optional live ClinicalTrials.gov integration after the core demo works.
- **Why:** The v1 demo should use curated/guided trial prompts for reliability. A live integration would strengthen the "latest clinical resources" story after the plan generator is stable.
- **Pros:** Makes the clinical evidence module feel more current and differentiates the product from generic patient education.
- **Cons:** Adds API/network failure modes, eligibility nuance, latency, and more test coverage.
- **Context:** The integration should search by condition, biomarkers, stage if known, location radius, recruitment status, and treatment status, then label every result as "ask your oncologist/trial team." It should never imply final eligibility.
- **Depends on / blocked by:** Core plan generation, source registry, safety pass, API client, fallback UI, and eval/test coverage for eligibility caveats.

## Live Provider And Insurance Verification

- **What:** Add live provider and insurance verification after v1.
- **Why:** Real users need accurate network status, accepting-patient status, appointment availability, prior authorization requirements, and cost-risk signals.
- **Pros:** Makes provider/insurance recommendations more actionable and reduces avoidable cost surprises.
- **Cons:** Requires payer/provider directory access, stale-data handling, rate-limit handling, stronger disclaimers, and more integration tests.
- **Context:** The hackathon demo should use curated provider/insurance cards with explicit "verify live" labels. A production version should integrate payer directories, provider directories, NCI/CMS quality signals, and prior authorization requirements where available.
- **Depends on / blocked by:** Production HIPAA readiness, vendor/API access, data freshness policy, user consent, audit logging, and fallback/error handling.
