import { parseNarrativeText } from '../../utils/narrativeText.js';
import { cn } from '../../utils/cn.js';

export const NarrativeProse = ({ className, content }) => {
  const blocks = parseNarrativeText(content);

  if (blocks.length === 0) {
    return <p className="m-0 text-sm italic text-muted">No content was generated.</p>;
  }

  return (
    <div className={cn('prose-narrative', className)}>
      {blocks.map((block, index) => {
        if (block.type === 'list') {
          return (
            <ul key={`b-${index}`}>
              {block.items.map((item, itemIndex) => (
                <li key={`b-${index}-${itemIndex}`}>{item}</li>
              ))}
            </ul>
          );
        }
        return <p key={`b-${index}`}>{block.text}</p>;
      })}
    </div>
  );
};
