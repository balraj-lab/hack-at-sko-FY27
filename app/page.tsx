import { IntakeExperience } from "@/components/intake-experience";

export default function Home() {
  return (
    <main className="page">
      <div className="shell">
        <header className="topbar">
          <div>
            <p className="eyebrow">Diagnosis to Plan hackathon demo</p>
            <h1>Turn a diagnosis profile into a doctor-ready plan.</h1>
            <p className="lead">
              Load a synthetic breast-cancer profile, generate a navigation packet,
              and export a visit-ready handout.
            </p>
          </div>
          <span className="status-pill">No real PHI</span>
        </header>

        <section className="warning" aria-label="No real patient data warning">
          Synthetic demo only. Do not enter real patient information. Production
          use requires HIPAA-eligible vendors, BAAs, access controls, audit logs,
          retention/deletion controls, and incident response.
        </section>

        <IntakeExperience />
      </div>
    </main>
  );
}
