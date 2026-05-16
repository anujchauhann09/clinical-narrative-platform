# Database Design

The database uses a hybrid identifier strategy:

- `id`: internal `BIGSERIAL` primary key for compact joins and indexes.
- `public_id`: external UUID for API exposure and client-facing references.

Core relationship rules:

- Deleting a user cascades to profile, symptom entries, join rows, and AI summaries.
- Deleting a symptom entry cascades to its join rows.
- Deleting symptoms or triggers is restricted while referenced by historical entries.

Critical indexes:

- `symptom_entries(user_id, logged_at DESC)` for timeline reads.
- `entry_symptoms(symptom_id)` and `entry_triggers(trigger_id)` for pattern analysis.
- `created_at` indexes on operational tables for audits, pagination, and retention jobs.
- `ai_summaries(user_id, generated_at DESC)` for clinical summary history.
