import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, FilePlus2, Info, Sparkles, Trash2, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { copilotApi } from '../../api/copilotApi.js';
import { useCopilotStore } from '../../store/copilotStore.js';
import { cn } from '../../utils/cn.js';
import { Button } from '../common/Button.jsx';
import { CopilotComposer } from './CopilotComposer.jsx';
import { CopilotDocuments } from './CopilotDocuments.jsx';
import { CopilotMessage } from './CopilotMessage.jsx';

const drawerMotion = {
  initial: { opacity: 0, y: 16, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.18, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: 12, scale: 0.98, transition: { duration: 0.14, ease: [0.22, 1, 0.36, 1] } },
};

const POLL_INTERVAL_MS = 4000;

export const CopilotChat = () => {
  const isOpen = useCopilotStore((state) => state.isOpen);
  const messages = useCopilotStore((state) => state.messages);
  const sending = useCopilotStore((state) => state.sending);
  const documents = useCopilotStore((state) => state.documents);
  const isLoadingDocuments = useCopilotStore((state) => state.isLoadingDocuments);
  const uploadError = useCopilotStore((state) => state.uploadError);
  const selectedDocumentId = useCopilotStore((state) => state.selectedDocumentId);

  const closeChat = useCopilotStore((state) => state.closeChat);
  const appendMessage = useCopilotStore((state) => state.appendMessage);
  const setSending = useCopilotStore((state) => state.setSending);
  const resetMessages = useCopilotStore((state) => state.resetMessages);
  const setDocuments = useCopilotStore((state) => state.setDocuments);
  const setLoadingDocuments = useCopilotStore((state) => state.setLoadingDocuments);
  const setUploadError = useCopilotStore((state) => state.setUploadError);
  const setSelectedDocumentId = useCopilotStore((state) => state.setSelectedDocumentId);

  const [uploading, setUploading] = useState(false);
  const [docsCollapsed, setDocsCollapsed] = useState(false);
  const scrollRef = useRef(null);

  const refreshDocuments = useCallback(async () => {
    try {
      setLoadingDocuments(true);
      const response = await copilotApi.listDocuments();
      setDocuments(response.data?.documents ?? []);
    } catch (_error) {
      setDocuments([]);
    }
  }, [setDocuments, setLoadingDocuments]);

  useEffect(() => {
    if (!isOpen) return undefined;
    refreshDocuments();
    return undefined;
  }, [isOpen, refreshDocuments]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const hasProcessing = documents.some((doc) => doc.status === 'processing');
    if (!hasProcessing) return undefined;
    const id = setInterval(refreshDocuments, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [documents, isOpen, refreshDocuments]);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, sending]);

  const handleSend = async (text) => {
    appendMessage({ role: 'user', content: text });
    setSending(true);
    try {
      const historyForApi = useCopilotStore
        .getState()
        .getApiHistory()
        .slice(0, -1); // exclude the just-sent user turn — backend appends it from `message`
      const response = await copilotApi.chat({
        message: text,
        history: historyForApi,
        documentPublicId: selectedDocumentId ?? undefined,
      });
      appendMessage({
        role: 'assistant',
        content: response.data?.message ?? 'No response.',
      });
    } catch (error) {
      appendMessage({
        role: 'assistant',
        content:
          error?.message ??
          'I ran into an issue answering that. Please try again in a moment.',
      });
    } finally {
      setSending(false);
    }
  };

  const handleUpload = async (file) => {
    setUploadError(null);
    setUploading(true);
    try {
      await copilotApi.uploadDocument(file);
      await refreshDocuments();
    } catch (error) {
      setUploadError(error?.message ?? 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (publicId) => {
    try {
      await copilotApi.deleteDocument(publicId);
      if (selectedDocumentId === publicId) setSelectedDocumentId(null);
      await refreshDocuments();
    } catch (_error) {
      // surfaced through documents list refresh; ignore here
    }
  };

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.section
          aria-label="SymptIQ Copilot"
          className="fixed bottom-24 right-4 z-50 flex h-[min(640px,calc(100vh-7rem))] w-[min(420px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-elevated"
          {...drawerMotion}
        >
          <header className="flex items-center justify-between gap-2 border-b border-border bg-ai-grad px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/15">
                <Sparkles aria-hidden="true" size={16} />
              </span>
              <div className="min-w-0">
                <h2 className="m-0 text-sm font-semibold tracking-tight">SymptIQ Copilot</h2>
                <p className="m-0 text-[11px] leading-tight text-white/80">
                  Healthcare-only assistant — not a substitute for a clinician.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                aria-label="Reset conversation"
                className="text-white hover:bg-white/15"
                icon={Trash2}
                onClick={resetMessages}
                size="icon"
                type="button"
                variant="ghost"
              />
              <Button
                aria-label="Close copilot"
                className="text-white hover:bg-white/15"
                icon={X}
                onClick={closeChat}
                size="icon"
                type="button"
                variant="ghost"
              />
            </div>
          </header>

          <div className="flex items-start gap-2 border-b border-border bg-warning/10 px-3 py-2 text-[11px] leading-snug text-warning">
            <Info aria-hidden="true" className="mt-px shrink-0" size={13} />
            <span>
              Chats are temporary and are not permanently stored. Closing this window or signing
              out clears the conversation. Documents you upload remain available across sessions
              until you delete them.
            </span>
          </div>

          <div className="border-b border-border">
            <button
              aria-expanded={!docsCollapsed}
              className="flex w-full items-center justify-between gap-2 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted hover:text-text"
              onClick={() => setDocsCollapsed((value) => !value)}
              type="button"
            >
              <span className="flex items-center gap-1.5">
                <FilePlus2 aria-hidden="true" size={12} />
                Your documents
              </span>
              <ChevronDown
                aria-hidden="true"
                className={cn(
                  'transition-transform duration-150',
                  docsCollapsed ? '-rotate-90' : 'rotate-0',
                )}
                size={14}
              />
            </button>
            {!docsCollapsed ? (
              <CopilotDocuments
                documents={documents}
                isLoading={isLoadingDocuments}
                onDelete={handleDelete}
                onSelect={setSelectedDocumentId}
                selectedDocumentId={selectedDocumentId}
              />
            ) : null}
            {uploadError ? (
              <p className="px-3 pb-2 text-[11px] text-danger" role="alert">
                {uploadError}
              </p>
            ) : null}
          </div>

          <div
            className="flex-1 overflow-y-auto px-3 py-3 scrollbar-thin"
            ref={scrollRef}
          >
            <div className="flex flex-col gap-3">
              {messages.map((message) => (
                <CopilotMessage content={message.content} key={message.id} role={message.role} />
              ))}
              {sending ? (
                <CopilotMessage content="Thinking…" role="assistant" />
              ) : null}
            </div>
          </div>

          <CopilotComposer
            disabled={sending}
            onSend={handleSend}
            onUpload={handleUpload}
            uploading={uploading}
          />
        </motion.section>
      ) : null}
    </AnimatePresence>
  );
};
