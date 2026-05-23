export const PrivacyPage = () => (
  <div className="mx-auto w-full max-w-3xl px-4 py-12 md:px-8 md:py-16">
    <p className="text-2xs font-semibold uppercase tracking-[0.14em] text-primary">Legal</p>
    <h1 className="mt-2 text-3xl font-semibold tracking-tight text-text md:text-4xl">Privacy Policy</h1>
    <p className="mt-2 text-xs text-muted">Last updated: May 17, 2026</p>

    <section className="mt-8 space-y-6 text-sm text-muted md:text-base">
      <div>
        <h2 className="m-0 text-lg font-semibold text-text">1. Information we collect</h2>
        <p className="mt-2">
          We collect information you provide directly when you create an account, update your
          profile, or log symptoms. This includes your name, email, and any clinical data you
          choose to record.
        </p>
      </div>

      <div>
        <h2 className="m-0 text-lg font-semibold text-text">2. Security of your information</h2>
        <p className="mt-2">
          We apply administrative, technical, and physical safeguards to protect your data.
          Authentication uses HttpOnly refresh tokens; sensitive data is encrypted at rest and
          in transit.
        </p>
      </div>

      <div>
        <h2 className="m-0 text-lg font-semibold text-text">3. Compliance posture</h2>
        <p className="mt-2">
          The platform is designed with HIPAA-style controls. All protected health information
          access is scoped to the authenticated patient and audited.
        </p>
      </div>
    </section>
  </div>
);
