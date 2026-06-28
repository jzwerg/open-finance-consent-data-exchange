// Milestone 0 consent dashboard: a minimal landing view confirming the stack is
// up. Granting / viewing / revoking consent (and live calls to the gateway) are
// later milestones — see MILESTONE.md.

export default function App() {
  return (
    <main className="card">
      <h1>Open Finance — Consent Dashboard</h1>
      <p className="lede">
        One API across open-banking standards, with user-permissioned,
        time-boxed, revocable consent.
      </p>

      <span className="badge">Milestone 0 · first boot</span>

      <ul className="checklist">
        <li>Gateway + auth API running on host port 8300</li>
        <li>Canonical model served through the UK OBIE adapter</li>
        <li>This dashboard served on host port 8301</li>
      </ul>

      <p className="note">
        Try the gateway:{" "}
        <code>curl -fsS localhost:8300/health</code> and{" "}
        <code>curl -fsS localhost:8300/obie/accounts</code>.
      </p>

      <p className="note muted">
        Consent grant / revoke and the token-replay demo arrive in later
        milestones.
      </p>
    </main>
  );
}
