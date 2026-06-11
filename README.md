# SKO 27 Health Navigator

Synthetic-data hackathon demo for turning a structured "new breast cancer diagnosis"
profile into a doctor-ready care navigation packet. The app is intentionally
sample-only: it should not collect, store, or process real patient information.

## Demo Script

1. Open `http://127.0.0.1:3000/`.
2. Click `Load sample profile`.
3. Click `Generate plan`.
4. Show the `Packet ready` summary, then walk through `Overview`.
5. Open `Appointment packet` and use `Print / Save PDF` or `Copy packet text`.
6. Open `Evidence details` to show source attachment, warnings, and safety labels.

The before/after story is simple: without the app, a newly diagnosed patient has
to turn scattered diagnosis, insurance, nutrition, movement, and support questions
into a coherent visit plan. With the app, a structured profile becomes a focused
packet the patient can bring to the next appointment.

## Architecture

See [ARCHITECTURE.md](ARCHITECTURE.md) for the current Cloudflare Quick Tunnel
deployment architecture, application-level architecture, and technology stack.

## Submission Evidence

See [HACKATHON_SUBMISSION.md](HACKATHON_SUBMISSION.md) for the demo script,
status-quo workflow, measurable KPI targets, market scope, buyer/user definition,
rubric alignment, and repository evidence.

Judge quick scan:

- User: newly diagnosed breast cancer patients and caregivers.
- Buyer: oncology navigation, cancer center patient experience, payer oncology
  case management, employer benefits, or cancer advocacy organizations.
- Market signal: ACS estimates about 321,910 new invasive breast cancer cases
  in US women in 2026 and more than 4 million US breast cancer survivors.
- Reachability: NCI lists 74 NCI-Designated Cancer Centers, and CoC says nearly
  1,400 US hospitals and cancer centers are accredited.
- KPI target: under 5 minutes from structured intake to printable appointment
  packet.

## Local Development

```bash
/Users/bkadaika/.bun/bin/bun install
/Users/bkadaika/.bun/bin/bun run dev --hostname 127.0.0.1
```

Useful checks:

```bash
/Users/bkadaika/.bun/bin/bun run typecheck
/Users/bkadaika/.bun/bin/bun test
/Users/bkadaika/.bun/bin/bun run build
```

## Safety Boundary

- Sample mode is enforced by the `/api/generate-plan` adapter.
- The PHI guard blocks obvious emails, phone numbers, SSNs, and street addresses.
- The cached sample-plan fallback is the default path.
- The model adapter is disabled unless explicitly configured.
- All outputs are educational navigation support and must be verified with the
  care team, insurer, or licensed clinician.

This is not HIPAA-compliant production software. A production version needs
HIPAA-eligible infrastructure and model vendors, signed BAAs where required,
authentication, role-based access control, audit logs, encryption, retention and
deletion controls, risk analysis, consent language, incident response, and breach
notification workflows before accepting real patient data.

## Optional Model Adapter

Copy `.env.example` to a local environment file and set:

```bash
ENABLE_MODEL_ADAPTER=true
OPENAI_MODEL=<model-name>
OPENAI_API_KEY=<key>
```

The adapter remains behind the same sample-mode guard. If the adapter is disabled,
unavailable, references unknown sources, or fails the safety pass, the API returns
the cached sample plan.

## Deployment Notes

Deploy to a host that supports Next.js API routes. Keep `ENABLE_MODEL_ADAPTER=false`
for the judged sample demo unless the API key, model, privacy posture, and fallback
behavior have been verified in that environment. Do not deploy with any path that
accepts real patient data until the production HIPAA readiness workstream is done.
