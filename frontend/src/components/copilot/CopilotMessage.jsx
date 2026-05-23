import { Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { cn } from '../../utils/cn.js';

const MARKDOWN_COMPONENTS = {
  p: ({ children }) => <p className="m-0 [&:not(:first-child)]:mt-2">{children}</p>,
  ul: ({ children }) => (
    <ul className="m-0 mt-1.5 list-disc space-y-0.5 pl-5 marker:text-muted">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="m-0 mt-1.5 list-decimal space-y-0.5 pl-5 marker:text-muted">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold text-text">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  h1: ({ children }) => <h3 className="m-0 mt-2 text-sm font-semibold tracking-tight">{children}</h3>,
  h2: ({ children }) => <h3 className="m-0 mt-2 text-sm font-semibold tracking-tight">{children}</h3>,
  h3: ({ children }) => <h3 className="m-0 mt-2 text-sm font-semibold tracking-tight">{children}</h3>,
  code: ({ inline, children }) =>
    inline ? (
      <code className="rounded bg-surface px-1 py-0.5 font-mono text-[11.5px]">{children}</code>
    ) : (
      <pre className="mt-1.5 overflow-x-auto rounded-lg bg-surface p-2 font-mono text-[11.5px]">
        <code>{children}</code>
      </pre>
    ),
  a: ({ children, href }) => (
    <a
      className="text-primary underline decoration-primary/30 underline-offset-2 hover:decoration-primary"
      href={href}
      rel="noopener noreferrer"
      target="_blank"
    >
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote className="mt-1.5 border-l-2 border-primary/30 pl-3 text-muted">{children}</blockquote>
  ),
  hr: () => <hr className="my-2 border-border" />,
};

export const CopilotMessage = ({ role, content }) => {
  const isUser = role === 'user';
  const Avatar = isUser ? User : Bot;

  return (
    <div
      className={cn(
        'flex items-start gap-2.5',
        isUser ? 'flex-row-reverse' : 'flex-row',
      )}
    >
      <span
        className={cn(
          'mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg',
          isUser ? 'bg-primary/15 text-primary' : 'bg-ai-grad text-white',
        )}
        aria-hidden="true"
      >
        <Avatar size={14} strokeWidth={2.2} />
      </span>
      <div
        className={cn(
          'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-soft',
          isUser
            ? 'whitespace-pre-wrap rounded-tr-md bg-primary text-primary-contrast'
            : 'rounded-tl-md bg-surface-2 text-text',
        )}
      >
        {isUser ? (
          content
        ) : (
          <ReactMarkdown components={MARKDOWN_COMPONENTS} remarkPlugins={[remarkGfm]}>
            {content}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
};
