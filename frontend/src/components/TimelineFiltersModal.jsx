import { useEffect, useMemo, useState } from 'react';

import { Button } from './Button.jsx';
import { Input } from './Input.jsx';
import { Modal } from './Modal.jsx';

const toLocalInput = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

const fromLocalInput = (value) => (value ? new Date(value).toISOString() : '');

const buildDraft = (filters) => ({
  from: toLocalInput(filters.from),
  to: toLocalInput(filters.to),
  severityMin: filters.severityMin ?? '',
  severityMax: filters.severityMax ?? '',
  mood: filters.mood ?? '',
  symptomIds: filters.symptomIds ?? [],
  triggerIds: filters.triggerIds ?? [],
});

export const TimelineFiltersModal = ({
  filters,
  isOpen,
  onApply,
  onClose,
  symptoms,
  triggers,
}) => {
  const [draft, setDraft] = useState(() => buildDraft(filters));
  const [validationError, setValidationError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setDraft(buildDraft(filters));
      setValidationError(null);
    }
  }, [filters, isOpen]);

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
    setDraft((current) => {
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
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const handleClear = () => {
    setDraft(
      buildDraft({
        from: '',
        to: '',
        severityMin: '',
        severityMax: '',
        mood: '',
        symptomIds: [],
        triggerIds: [],
      }),
    );
  };

  const handleApply = () => {
    const severityMin = draft.severityMin === '' ? undefined : Number(draft.severityMin);
    const severityMax = draft.severityMax === '' ? undefined : Number(draft.severityMax);

    if (severityMin !== undefined && (severityMin < 1 || severityMin > 10)) {
      setValidationError('Severity must be between 1 and 10');
      return;
    }
    if (severityMax !== undefined && (severityMax < 1 || severityMax > 10)) {
      setValidationError('Severity must be between 1 and 10');
      return;
    }
    if (severityMin !== undefined && severityMax !== undefined && severityMin > severityMax) {
      setValidationError('Severity min must be ≤ severity max');
      return;
    }
    if (draft.from && draft.to && new Date(draft.from) > new Date(draft.to)) {
      setValidationError('"From" must be earlier than "To"');
      return;
    }

    onApply({
      from: fromLocalInput(draft.from),
      to: fromLocalInput(draft.to),
      severityMin,
      severityMax,
      mood: draft.mood.trim() || undefined,
      symptomIds: draft.symptomIds,
      triggerIds: draft.triggerIds,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Filter timeline">
      <div className="entry-form">
        <div className="entry-form__row">
          <Input
            id="filter-from"
            label="From"
            onChange={(event) => updateField('from', event.target.value)}
            type="datetime-local"
            value={draft.from}
          />
          <Input
            id="filter-to"
            label="To"
            onChange={(event) => updateField('to', event.target.value)}
            type="datetime-local"
            value={draft.to}
          />
        </div>

        <div className="entry-form__row">
          <Input
            id="filter-severity-min"
            label="Severity min"
            max={10}
            min={1}
            onChange={(event) => updateField('severityMin', event.target.value)}
            type="number"
            value={draft.severityMin}
          />
          <Input
            id="filter-severity-max"
            label="Severity max"
            max={10}
            min={1}
            onChange={(event) => updateField('severityMax', event.target.value)}
            type="number"
            value={draft.severityMax}
          />
        </div>

        <Input
          id="filter-mood"
          label="Mood contains"
          onChange={(event) => updateField('mood', event.target.value)}
          placeholder="e.g. anxious"
          type="text"
          value={draft.mood}
        />

        <fieldset className="entry-form__group">
          <legend className="field__label">Symptoms (any of)</legend>
          {groupedSymptoms.length === 0 ? (
            <p className="entry-form__hint">No symptoms available.</p>
          ) : (
            <div className="chip-group">
              {groupedSymptoms.map(([category, items]) => (
                <div className="chip-group__category" key={category}>
                  <p className="chip-group__heading">{category}</p>
                  <div className="chip-group__chips">
                    {items.map((symptom) => {
                      const isSelected = draft.symptomIds.includes(symptom.publicId);
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
          <legend className="field__label">Triggers (any of)</legend>
          {(triggers ?? []).length === 0 ? (
            <p className="entry-form__hint">No triggers available.</p>
          ) : (
            <div className="chip-group__chips">
              {triggers.map((trigger) => {
                const isSelected = draft.triggerIds.includes(trigger.publicId);
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
          <Button onClick={handleClear} type="button" variant="ghost">
            Clear all
          </Button>
          <Button onClick={onClose} type="button" variant="secondary">
            Cancel
          </Button>
          <Button onClick={handleApply} type="button">
            Apply
          </Button>
        </div>
      </div>
    </Modal>
  );
};
