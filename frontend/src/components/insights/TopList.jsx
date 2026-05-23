import { Card } from '../common/Card.jsx';

const formatAvg = (value) => (value === null || value === undefined ? '—' : value.toFixed(1));

export const TopList = ({ items = [], emptyLabel, title, subtitleFor }) => {
  const maxCount = Math.max(1, ...items.map((item) => item.count ?? 0));
  return (
    <Card>
      <Card.Header>
        <Card.Title as="h3">{title}</Card.Title>
      </Card.Header>
      <Card.Body>
        {items.length === 0 ? (
          <p className="m-0 text-sm text-muted">{emptyLabel}</p>
        ) : (
          <ul className="m-0 flex flex-col gap-2 p-0">
            {items.map((item) => (
              <li
                className="flex items-center justify-between gap-3 rounded-xl px-2 py-2 hover:bg-surface-2"
                key={item.publicId}
              >
                <div className="min-w-0">
                  <p className="m-0 truncate text-sm font-medium text-text">{item.name}</p>
                  <p className="m-0 text-xs text-muted">
                    {subtitleFor ? subtitleFor(item) : `avg severity ${formatAvg(item.averageSeverity)}`}
                  </p>
                </div>
                <div className="flex w-32 items-center justify-end gap-2">
                  <div className="h-1.5 w-20 overflow-hidden rounded-full bg-surface-2">
                    <span
                      className="block h-full rounded-full bg-primary"
                      style={{ width: `${Math.round((item.count / maxCount) * 100)}%` }}
                    />
                  </div>
                  <span className="w-6 text-right text-xs font-semibold text-text tabular-nums">
                    {item.count}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card.Body>
    </Card>
  );
};
