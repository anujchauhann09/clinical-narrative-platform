import { MessageCircle, X } from 'lucide-react';

import { useCopilotStore } from '../../store/copilotStore.js';
import { cn } from '../../utils/cn.js';
import { CopilotChat } from './CopilotChat.jsx';

export const CopilotFab = () => {
  const isOpen = useCopilotStore((state) => state.isOpen);
  const toggleChat = useCopilotStore((state) => state.toggleChat);
  const Icon = isOpen ? X : MessageCircle;

  return (
    <>
      <CopilotChat />
      <button
        aria-label={isOpen ? 'Close Clinical Copilot' : 'Open Clinical Copilot'}
        aria-pressed={isOpen}
        className={cn(
          'fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center rounded-full text-white shadow-elevated',
          'bg-ai-grad transition-transform duration-150 ease-smooth hover:scale-[1.04] active:scale-95',
          'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40',
        )}
        onClick={toggleChat}
        type="button"
      >
        <Icon aria-hidden="true" size={22} strokeWidth={2.1} />
      </button>
    </>
  );
};
