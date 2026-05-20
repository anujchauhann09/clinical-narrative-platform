import { useEffect, useMemo, useState } from 'react';

import { Button } from './Button.jsx';
import { Input } from './Input.jsx';
import { symptomEntrySchema } from '../validators/symptomEntry.validator.js';

const toLocalInput = (isoString) => {
  const date = isoString ? new Date(isoString) : new Date();
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

const buildDefaultValues = (entry) => ({
  severity: entry?.severity ?? 5,
  mood: entry?.mood ?? '',
  notes: entry?.notes ?? '',
  loggedAt: toLocalInput(entry?.loggedAt),
  symptomIds: entry?.symptoms?.map((symptom) => symptom.publicId) ?? [],
  triggerIds: entry?.triggers?.map((trigger) => trigger.publicId) ?? [],
});

export const SymptomEntryForm = ({
  entry,
  symptoms,
  triggers,
  isSubmitting,
  submitLabel = 'Save entry',
  onSubmit,
  onCancel,
}) => {
  const [values, setValues] = useState(() => buildDefaultValues(entry));
  const [validationError, setValidationError] = useState(null);

  useEffect(() => {
    setValues(buildDefaultValues(entry));
    setValidationError(null);
  }, [entry]);

  const groupedSymptoms = useMemo(() => {
    const groups = new Map();
    for (const symptom of symptoms ?? []) {
      const list = groups.get(symptom.category) ?? [];
      list.push(symptom);
      groups.set(symptom.category, list);
    }
    return Array.from(groups.entries());
  }, [symptoms]);

  const toggleId = (field, id) => {
    setValues((current) => {
      const currentIds = current[field];
      return {
        ...current,
        [field]: currentIds.includes(id)
          ? currentIds.filter((existing) => existing !== id)
          : [...currentIds, id],
      };
    });
  };

  const updateField = (field, value) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

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

  return (
    <form className="entry-form" onSubmit={handleSubmit}>
      <div className="entry-form__row">
        <Input
          id="entry-loggedAt"
          label="When did this happen?"
          name="loggedAt"
          onChange={(event) => updateField('loggedAt', event.target.value)}
          type="datetime-local"
          value={values.loggedAt}
        />

        <label className="field" htmlFor="entry-severity">
          <span className="field__label">Severity ({values.severity}/10)</span>
          <input
            className="field__range"
            id="entry-severity"
            max={10}
            min={1}
            name="severity"
            onChange={(event) => updateField('severity', Number(event.target.value))}
            type="range"
            value={values.severity}
          />
        </label>
      </div>

      <Input
        id="entry-mood"
        label="Mood (optional)"
        name="mood"
        onChange={(event) => updateField('mood', event.target.value)}
        placeholder="e.g. anxious, hopeful, tired"
        type="text"
        value={values.mood}
      />

      <label className="field" htmlFor="entry-notes">
        <span className="field__label">Notes (optional)</span>
        <textarea
          className="field__input field__textarea"
          id="entry-notes"
          name="notes"
          onChange={(event) => updateField('notes', event.target.value)}
          placeholder="Describe what you're experiencing..."
          rows={3}
          value={values.notes}
        />
      </label>

      <fieldset className="entry-form__group">
        <legend className="field__label">Symptoms</legend>
        {groupedSymptoms.length === 0 ? (
          <p className="entry-form__hint">Loading symptoms...</p>
        ) : (
          <div className="chip-group">
            {groupedSymptoms.map(([category, items]) => (
              <div className="chip-group__category" key={category}>
                <p className="chip-group__heading">{category}</p>
                <div className="chip-group__chips">
                  {items.map((symptom) => {
                    const isSelected = values.symptomIds.includes(symptom.publicId);
                    return (
                      <button
                        aria-pressed={isSelected}
                        className={`chip${isSelected ? ' chip--active' : ''}`}
                        key={symptom.publicId}
                        onClick={() => toggleId('symptomIds', symptom.publicId)}
                        type="button"
                      >
                        {symptom.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </fieldset>

      <fieldset className="entry-form__group">
        <legend className="field__label">Triggers (optional)</legend>
        {(triggers ?? []).length === 0 ? (
          <p className="entry-form__hint">Loading triggers...</p>
        ) : (
          <div className="chip-group__chips">
            {triggers.map((trigger) => {
              const isSelected = values.triggerIds.includes(trigger.publicId);
              return (
                <button
                  aria-pressed={isSelected}
                  className={`chip${isSelected ? ' chip--active' : ''}`}
                  key={trigger.publicId}
                  onClick={() => toggleId('triggerIds', trigger.publicId)}
                  type="button"
                >
                  {trigger.name}
                </button>
              );
            })}
          </div>
        )}
      </fieldset>

      {validationError ? <p className="form-error">{validationError}</p> : null}

      <div className="entry-form__actions">
        {onCancel ? (
          <Button onClick={onCancel} type="button" variant="secondary">
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
