import { create } from 'zustand';

const createId = () =>
  (typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`);

const WELCOME_MESSAGE = {
  role: 'assistant',
  content:
    "Hi — I'm your SymptIQ Copilot. I can help you understand your logged symptoms, severity trends, triggers, and any clinical documents you've uploaded. Ask me anything health-related. I won't diagnose; for anything urgent, please contact a clinician.",
};

const seed = () => [{ id: createId(), ...WELCOME_MESSAGE, createdAt: new Date().toISOString() }];

// Session-only store. Chats live in memory and are cleared when the tab closes
// or the user signs out. No persistence to disk or backend.
export const useCopilotStore = create((set, get) => ({
  isOpen: false,
  messages: seed(),
  sending: false,
  documents: [],
  isLoadingDocuments: false,
  uploadError: null,
  selectedDocumentId: null,

  openChat() {
    set({ isOpen: true });
  },
  closeChat() {
    set({ isOpen: false });
  },
  toggleChat() {
    set((state) => ({ isOpen: !state.isOpen }));
  },

  setSending(sending) {
    set({ sending });
  },

  appendMessage(message) {
    set((state) => ({
      messages: [
        ...state.messages,
        { id: createId(), createdAt: new Date().toISOString(), ...message },
      ],
    }));
  },

  resetMessages() {
    set({ messages: seed() });
  },

  setDocuments(documents) {
    set({ documents, isLoadingDocuments: false });
  },
  setLoadingDocuments(isLoadingDocuments) {
    set({ isLoadingDocuments });
  },
  setUploadError(uploadError) {
    set({ uploadError });
  },
  setSelectedDocumentId(selectedDocumentId) {
    set({ selectedDocumentId });
  },

  getApiHistory() {
    // Strip the synthetic welcome turn before sending so it doesn't anchor the model.
    const turns = get().messages.slice(1);
    return turns.map(({ role, content }) => ({ role, content }));
  },
}));
