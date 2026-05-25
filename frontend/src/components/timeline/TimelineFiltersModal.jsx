import { useEffect, useMemo, useState } from 'react';

import { Button } from '../common/Button.jsx';
import { Input } from '../common/Input.jsx';
import { Modal } from '../common/Modal.jsx';
import { ChipMultiSelect } from '../forms/ChipGroup.jsx';
import { dateService } from '../../services/dateService.js';

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
  const maxDateTime = useMemo(() => dateService.nowDatetimeLocal(), []);

  useEffect(() => {
    if (isOpen) {
      setDraft(buildDraft(filters));
      setValidationError(null);
    }
  }, [filters, isOpen]);

  const groupSymptoms = useMemo(() => (item) => item.category, []);

  const toggleId = (field, id) => {
    setDraft((current) => {
      const ids = current[field];
      return {
        ...current,
        [field]: ids.includes(id) ? ids.filter((existing) => existing !== id) : [...ids, id],
      };
    });
  };

  const updateField = (field, value) => setDraft((current) => ({ ...current, [field]: value }));

  const handleClear = () =>
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
    <Modal
      footer={
        <>
          <Button onClick={handleClear} variant="ghost">
            Clear all
          </Button>
          <Button onClick={onClose} variant="secondary">
            Cancel
          </Button>
          <Button onClick={handleApply}>Apply filters</Button>
        </>
      }
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title="Filter timeline"
    >
      <div className="flex flex-col gap-4">
        <div className="grid gap-3 md:grid-cols-2">
          <Input
            label="From"
            max={maxDateTime}
            onChange={(event) => updateField('from', event.target.value)}
            type="datetime-local"
            value={draft.from}
          />
          <Input
            label="To"
            max={maxDateTime}
            onChange={(event) => updateField('to', event.target.value)}
            type="datetime-local"
            value={draft.to}
          />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <Input
            label="Severity min"
            max={10}
            min={1}
            onChange={(event) => updateField('severityMin', event.target.value)}
            type="number"
            value={draft.severityMin}
          />
          <Input
            label="Severity max"
            max={10}
            min={1}
            onChange={(event) => updateField('severityMax', event.target.value)}
            type="number"
            value={draft.severityMax}
          />
        </div>

        <Input
          label="Mood contains"
          onChange={(event) => updateField('mood', event.target.value)}
          placeholder="e.g. anxious"
          value={draft.mood}
        />

        <ChipMultiSelect
          emptyLabel="No symptoms available."
          groupBy={groupSymptoms}
          items={symptoms}
          legend="Symptoms (any of)"
          onToggle={(id) => toggleId('symptomIds', id)}
          value={draft.symptomIds}
        />

        <ChipMultiSelect
          emptyLabel="No triggers available."
          items={triggers}
          legend="Triggers (any of)"
          onToggle={(id) => toggleId('triggerIds', id)}
          value={draft.triggerIds}
        />

        {validationError ? (
          <p className="text-sm font-medium text-danger" role="alert">
            {validationError}
          </p>
        ) : null}
      </div>
    </Modal>
  );
};
