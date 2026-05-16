import { TimelineCard } from '../components/index.js';

const emptyEntry = {
  id: 'empty',
  title: 'Timeline ready',
  severity: 1,
  loggedAt: new Date().toISOString(),
  notes: 'Connect this page to symptomApi.getTimeline when backend endpoints are available.',
  symptoms: ['Foundation'],
};

export const TimelinePage = () => (
  <div className="page">
    <header className="page-header">
      <div>
        <p className="eyebrow">Patient journey</p>
        <h1>Timeline</h1>
      </div>
    </header>
    <TimelineCard entry={emptyEntry} />
  </div>
);
