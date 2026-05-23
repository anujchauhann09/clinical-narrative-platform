import { APP_NAME } from '../constants/app.js';

const Section = ({ title, children }) => (
  <div>
    <h2 className="m-0 text-lg font-semibold text-text">{title}</h2>
    <div className="mt-2 space-y-3">{children}</div>
  </div>
);

export const PrivacyPage = () => (
  <div className="mx-auto w-full max-w-3xl px-4 py-12 md:px-8 md:py-16">
    <p className="text-2xs font-semibold uppercase tracking-[0.14em] text-primary">Legal</p>
    <h1 className="mt-2 text-3xl font-semibold tracking-tight text-text md:text-4xl">
      Privacy Policy
    </h1>
    <p className="mt-2 text-xs text-muted">Last updated: May 23, 2026</p>

    <p className="mt-6 text-sm text-muted md:text-base">
      This Privacy Policy explains what information {APP_NAME} (&ldquo;we&rdquo;, &ldquo;us&rdquo;)
      collects when you use the platform, how we use it, who we share it with, and the rights you
      have over your data. {APP_NAME} handles personal health information; we treat it
      accordingly.
    </p>

    <section className="mt-8 space-y-8 text-sm text-muted md:text-base">
      <Section title="1. Information we collect">
        <p>
          <strong className="text-text">Account information.</strong> Name, email address, hashed
          password, and profile details you choose to add (date of birth, gender, locale).
        </p>
        <p>
          <strong className="text-text">Health and symptom data you log.</strong> Symptom names,
          severity, mood, triggers, notes, attachments, and timestamps you record in the
          timeline. This is treated as sensitive personal data.
        </p>
        <p>
          <strong className="text-text">Copilot uploads.</strong> Documents you upload to the AI
          copilot for question-answering. These are chunked, embedded, and stored against your
          account so the copilot can ground its answers in your own material.
        </p>
        <p>
          <strong className="text-text">Technical data.</strong> Authentication cookies, IP
          address, browser user-agent, and timestamps of API calls — captured in audit logs for
          security and abuse prevention.
        </p>
        <p>
          We do <em>not</em> collect third-party tracking identifiers, ad-network data, or
          behavioural profiles. We do not sell data to anyone, ever.
        </p>
      </Section>

      <Section title="2. How we use your information">
        <p>
          To operate the platform — render your timeline, run the insights engine, generate AI
          narratives, produce clinical PDFs, and answer copilot questions about your own history.
        </p>
        <p>
          To keep your account secure — authenticate you, rotate session tokens, detect abuse,
          and produce audit trails of access to protected health information.
        </p>
        <p>
          To communicate with you about your account, security events, or material changes to
          this policy. We do not send marketing email.
        </p>
      </Section>

      <Section title="3. AI processing">
        <p>
          {APP_NAME} uses LLM API to generate clinical narratives, power the
          copilot, and create vector embeddings for document search. When you trigger an
          AI-assisted feature, the relevant portion of your data (for example, a recent slice of
          your symptom log or a copilot question and its retrieved context) is sent to that
          API over an encrypted channel.
        </p>
        <p>
          We send the <em>minimum context required</em> for the task and do not include your name
          or email in prompts. Your prompts and
          responses are not used to train their models. The insights engine itself — correlations,
          trends, day-of-week patterns — runs entirely on our servers using deterministic
          statistics; no AI is involved in those numbers.
        </p>
      </Section>

      <Section title="4. How we secure your information">
        <p>
          Data is encrypted in transit (TLS) and at rest. Passwords are hashed with bcrypt.
          Authentication uses HttpOnly, Secure, SameSite-restricted cookies; the access token
          rotates frequently and the refresh token can be revoked server-side.
        </p>
        <p>
          State-changing API requests require a double-submit CSRF check. Rate limiting is
          applied at the edge. Every access to protected health information is recorded in an
          audit log scoped to the authenticated user.
        </p>
        <p>
          No system is perfectly secure. If a breach occurs that affects your data, we will
          notify you and the appropriate authorities within the timeframes required by law.
        </p>
      </Section>

      <Section title="5. Data sharing">
        <p>
          We share data with the following categories of service providers strictly to operate
          the platform: cloud hosting (compute, database, storage), the LLM API for the AI
          features described in section 3, and Vector DB for vector search supporting the copilot.
          Each is bound by a data processing agreement.
        </p>
        <p>
          We do not share your data with employers, insurers, advertisers, or data brokers. We
          will disclose data if compelled by a valid legal order, and we will challenge requests
          we believe to be overbroad.
        </p>
      </Section>

      <Section title="6. Your rights">
        <p>
          <strong className="text-text">Access &amp; export.</strong> You can view all your data
          inside the app and export a complete clinical PDF at any time.
        </p>
        <p>
          <strong className="text-text">Correction.</strong> You can edit any entry in the
          timeline; older versions are not retained beyond what audit logs require.
        </p>
        <p>
          <strong className="text-text">Deletion.</strong> You can delete your account from
          Settings. This removes your profile, symptom log, copilot documents, embeddings, and
          generated narratives. Audit log entries are retained in pseudonymous form for the
          period required by law.
        </p>
        <p>
          Depending on where you live, you may have additional rights under HIPAA, GDPR, or
          comparable laws (data portability, restriction of processing, objection, lodging a
          complaint with a supervisory authority). Contact us to exercise them.
        </p>
      </Section>

      <Section title="7. Cookies">
        <p>
          We use cookies only for authentication and CSRF protection. There are no analytics,
          advertising, or tracking cookies. Cookie attributes (HttpOnly, Secure, SameSite) are
          set to minimise exposure to cross-site attacks.
        </p>
      </Section>

      <Section title="8. Children">
        <p>
          {APP_NAME} is not directed at children under 13 (or under 16 in jurisdictions where
          that is the relevant threshold). Do not create an account for a minor without the legal
          authority to do so.
        </p>
      </Section>

      <Section title="9. Not medical advice">
        <p>
          The narratives, insights, and PDF reports {APP_NAME} produces are decision aids, not
          medical advice, diagnosis, or treatment. Always consult a qualified clinician about
          your health.
        </p>
      </Section>

      <Section title="10. Contact">
        <p>
          Questions, requests, or concerns about your data? Email{' '}
          <a className="text-primary underline" href="mailto:heyanujchauhan@gmail.com">
            heyanujchauhan@gmail.com
          </a>
          . We respond to verified requests within 30 days.
        </p>
      </Section>
    </section>
  </div>
);
