import { Paperclip, Send } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { cn } from '../../utils/cn.js';
import { Button } from '../common/Button.jsx';

const MAX_LEN = 4000;
const MIN_ROWS_HEIGHT = 40;
const MAX_ROWS_HEIGHT = 140;

export const CopilotComposer = ({ disabled, onSend, onUpload, uploading }) => {
  const [value, setValue] = useState('');
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  // Grow with content but cap the height so the composer never overflows the drawer.
  useEffect(() => {
    const node = textareaRef.current;
    if (!node) return;
    node.style.height = `${MIN_ROWS_HEIGHT}px`;
    const next = Math.min(node.scrollHeight, MAX_ROWS_HEIGHT);
    node.style.height = `${next}px`;
    node.style.overflowY = node.scrollHeight > MAX_ROWS_HEIGHT ? 'auto' : 'hidden';
  }, [value]);

  const submit = (event) => {
    event?.preventDefault?.();
    const text = value.trim();
    if (!text || disabled) return;
    onSend(text);
    setValue('');
  };

  const handleKey = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    await onUpload(file);
  };

  return (
    <form className="flex flex-col gap-2 border-t border-border bg-surface/60 px-3 py-3" onSubmit={submit}>
      <div className="flex items-end gap-2">
        <input
          accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
          aria-label="Attach a clinical document"
          className="hidden"
          onChange={handleFileChange}
          ref={fileInputRef}
          type="file"
        />
        <Button
          aria-label="Upload PDF, DOCX, or TXT"
          disabled={uploading}
          icon={Paperclip}
          isLoading={uploading}
          onClick={() => fileInputRef.current?.click()}
          size="icon"
          type="button"
          variant="ghost"
        />
        <textarea
          className={cn(
            'flex-1 resize-none overflow-hidden rounded-xl border border-border bg-surface px-3 py-2 text-sm leading-5 text-text placeholder:text-muted/70',
            'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30',
          )}
          disabled={disabled}
          maxLength={MAX_LEN}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={handleKey}
          placeholder="Ask a health question…"
          ref={textareaRef}
          rows={1}
          style={{ height: MIN_ROWS_HEIGHT, maxHeight: MAX_ROWS_HEIGHT }}
          value={value}
        />
        <Button
          aria-label="Send"
          disabled={disabled || !value.trim()}
          icon={Send}
          size="icon"
          type="submit"
          variant="primary"
        />
      </div>
    </form>
  );
};
