import { useEffect, useMemo, useState } from 'react';

import { Button } from '../common/Button.jsx';
import { Input, Textarea } from '../common/Input.jsx';
import { dateService } from '../../services/dateService.js';
import { symptomEntrySchema } from '../../validators/symptomEntry.validator.js';
import { ChipMultiSelect } from './ChipGroup.jsx';
import { SeveritySlider } from './SeveritySlider.jsx';


const pad = (value) => String(value).padStart(2, '0');

const toLocalInput = (isoString) => {
  const date = isoString ? new Date(isoString) : new Date();
  if (Number.isNaN(date.getTime())) return '';
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
};

const buildDefaultValues = (entry) => ({
  severity: entry?.severity ?? 5,
  mood: entry?.mood ?? '',
  notes: entry?.notes ?? '',
  loggedAt: toLocalInput(entry?.loggedAt),
  symptomIds: entry?.symptoms?.map((symptom) => symptom.publicId) ?? [],
  triggerIds: entry?.triggers?.map((trigger) => trigger.publicId) ?? [],
});

const SectionLabel = ({ children }) => (
  <p className="text-2xs font-semibold uppercase tracking-[0.14em] text-muted">{children}</p>
);

export const SymptomEntryForm = ({
  entry,
  isSubmitting,
  onCancel,
  onSubmit,
  submitLabel = 'Save entry',
  symptoms,
  triggers,
}) => {
  const [values, setValues] = useState(() => buildDefaultValues(entry));
  const [validationError, setValidationError] = useState(null);
  const maxLoggedAt = useMemo(() => dateService.nowDatetimeLocal(), []);

  useEffect(() => {
    setValues(buildDefaultValues(entry));
    setValidationError(null);
  }, [entry]);

  const toggleId = (field, id) => {
    setValues((current) => {
      const ids = current[field];
      return {
        ...current,
        [field]: ids.includes(id) ? ids.filter((value) => value !== id) : [...ids, id],
      };
    });
  };

  const updateField = (field, value) => setValues((current) => ({ ...current, [field]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    const parsed = symptomEntrySchema.safeParse({
      ...values,
      loggedAt: new Date(values.loggedAt).toISOString(),
    });
    if (!parsed.success) {
      setValidationError(parsed.error.issues[0]?.message ?? 'Please review the form');
      return;
    }
    setValidationError(null);
    await onSubmit(parsed.data);
  };

  const groupSymptoms = useMemo(() => (item) => item.category, []);

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
      <section className="flex flex-col gap-3">
        <SectionLabel>When &amp; how it felt</SectionLabel>
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="When did this happen?"
            max={maxLoggedAt}
            onChange={(event) => updateField('loggedAt', event.target.value)}
            required
            type="datetime-local"
            value={values.loggedAt}
          />
          <SeveritySlider
            onChange={(value) => updateField('severity', value)}
            value={values.severity}
          />
        </div>
        <Input
          label="Mood (optional)"
          onChange={(event) => updateField('mood', event.target.value)}
          placeholder="e.g. anxious, hopeful, tired"
          value={values.mood}
        />
      </section>

      <section className="flex flex-col gap-3">
        <SectionLabel>Symptoms &amp; triggers</SectionLabel>
        <div className="grid gap-4 md:grid-cols-2">
          <ChipMultiSelect
            emptyLabel="Loading symptoms…"
            groupBy={groupSymptoms}
            items={symptoms}
            legend="Symptoms"
            onToggle={(id) => toggleId('symptomIds', id)}
            value={values.symptomIds}
          />
          <ChipMultiSelect
            emptyLabel="Loading triggers…"
            items={triggers}
            legend="Triggers (optional)"
            onToggle={(id) => toggleId('triggerIds', id)}
            value={values.triggerIds}
          />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <SectionLabel>Context</SectionLabel>
        <Textarea
          label="Notes (optional)"
          onChange={(event) => updateField('notes', event.target.value)}
          placeholder="Describe what you're experiencing…"
          rows={3}
          value={values.notes}
        />
      </section>

      {validationError ? (
        <p className="rounded-lg border border-danger/30 bg-danger/5 px-3 py-2 text-sm font-medium text-danger" role="alert">
          {validationError}
        </p>
      ) : null}

      <div className="flex flex-col-reverse gap-2 border-t border-border/60 pt-4 sm:flex-row sm:justify-end">
        {onCancel ? (
          <Button onClick={onCancel} type="button" variant="ghost">
            Cancel
          </Button>
        ) : null}
        <Button isLoading={isSubmitting} type="submit">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};
