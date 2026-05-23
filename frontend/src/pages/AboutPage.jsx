export const AboutPage = () => (
  <div className="mx-auto w-full max-w-3xl px-4 py-12 md:px-8 md:py-16">
    <p className="text-2xs font-semibold uppercase tracking-[0.14em] text-primary">About us</p>
    <h1 className="mt-2 text-3xl font-semibold tracking-tight text-text md:text-4xl">Our mission</h1>
    <p className="mt-4 text-base text-muted md:text-lg">
      We believe patients and clinicians shouldn't have to piece together fragmented medical data
      to understand a story. The Clinical Narrative Platform unifies symptom history, surfaces
      patterns automatically, and converts raw entries into clinical narratives a doctor can use.
    </p>

    <div className="mt-10 grid gap-6 md:grid-cols-2">
      <article className="rounded-2xl border border-border bg-surface p-6 shadow-soft">
        <h2 className="m-0 text-lg font-semibold text-text">The problem</h2>
        <p className="mt-2 text-sm text-muted">
          Modern medicine generates vast amounts of data, but it's scattered across portals,
          notes, and apps. The chronological story — the actual signal — gets lost.
        </p>
      </article>
      <article className="rounded-2xl border border-border bg-surface p-6 shadow-soft">
        <h2 className="m-0 text-lg font-semibold text-text">Our approach</h2>
        <p className="mt-2 text-sm text-muted">
          Capture entries quickly, analyze them with a transparent insights engine, and let
          AI-assisted narratives translate the data into language a clinician can act on.
        </p>
      </article>
    </div>
  </div>
);
