import { CheckCircle2, FileText, Loader2, Trash2, TriangleAlert } from 'lucide-react';

import { cn } from '../../utils/cn.js';
import { Button } from '../common/Button.jsx';

const STATUS_TONE = {
  ready: 'text-success',
  processing: 'text-muted',
  failed: 'text-danger',
};

const STATUS_ICON = {
  ready: CheckCircle2,
  processing: Loader2,
  failed: TriangleAlert,
};

const formatBytes = (bytes) => {
  if (!bytes) return '0 KB';
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
};

export const CopilotDocuments = ({
  documents,
  isLoading,
  onDelete,
  onSelect,
  selectedDocumentId,
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-xs text-muted">
        <Loader2 className="animate-spin" size={14} /> Loading your documents…
      </div>
    );
  }

  if (!documents.length) {
    return (
      <p className="px-3 py-2 text-xs leading-relaxed text-muted">
        No documents yet. Attach a PDF, DOCX, or TXT to ask questions about it.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-1.5 px-2 py-2">
      {documents.map((document) => {
        const Icon = STATUS_ICON[document.status] ?? FileText;
        const isSelected = selectedDocumentId === document.publicId;
        const isReady = document.status === 'ready';
        return (
          <li
            className={cn(
              'flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs',
              isSelected
                ? 'border-primary/50 bg-primary/5'
                : 'border-border bg-surface',
            )}
            key={document.publicId}
          >
            <FileText aria-hidden="true" className="text-muted" size={14} />
            <button
              className="min-w-0 flex-1 truncate text-left text-text hover:text-primary disabled:cursor-not-allowed disabled:hover:text-text"
              disabled={!isReady}
              onClick={() => onSelect(isSelected ? null : document.publicId)}
              title={
                isReady
                  ? isSelected
                    ? 'Clear focus on this document'
                    : 'Ask the copilot to focus on this document'
                  : 'Available once indexing finishes'
              }
              type="button"
            >
              {document.filename}
            </button>
            <span className={cn('flex items-center gap-1', STATUS_TONE[document.status])} title={document.errorMessage ?? document.status}>
              <Icon
                aria-hidden="true"
                className={document.status === 'processing' ? 'animate-spin' : ''}
                size={12}
              />
              <span className="hidden sm:inline">{formatBytes(document.byteSize)}</span>
            </span>
            <Button
              aria-label={`Remove ${document.filename}`}
              icon={Trash2}
              onClick={() => onDelete(document.publicId)}
              size="icon"
              type="button"
              variant="ghost"
            />
          </li>
        );
      })}
    </ul>
  );
};
