import { Plus } from 'lucide-react';

import { Badge, Button, Card, TimelineCard } from '../components/index.js';

const sampleEntries = [
  {
    id: '1',
    title: 'Migraine pattern noted',
    severity: 8,
    loggedAt: new Date().toISOString(),
    notes: 'Pain increased after poor sleep and long screen exposure.',
    symptoms: ['Headache', 'Nausea', 'Light sensitivity'],
  },
  {
    id: '2',
    title: 'Lower symptom burden',
    severity: 3,
    loggedAt: new Date(Date.now() - 86_400_000).toISOString(),
    notes: 'Improved after hydration and rest.',
    symptoms: ['Fatigue'],
  },
];

export const DashboardPage = () => (
  <div className="page">
    <header className="page-header">
      <div>
        <p className="eyebrow">Medical timeline</p>
        <h1>Clinical narrative overview</h1>
      </div>
      <Button icon={Plus}>New entry</Button>
    </header>

    <section className="metrics-grid" aria-label="Timeline metrics">
      <Card>
        <span className="metric__label">Entries this month</span>
        <strong className="metric__value">18</strong>
      </Card>
      <Card>
        <span className="metric__label">Average severity</span>
        <strong className="metric__value">5.4</strong>
      </Card>
      <Card>
        <span className="metric__label">AI summaries</span>
        <strong className="metric__value">4</strong>
      </Card>
    </section>

    <section className="content-grid">
      <div className="timeline-list">
        {sampleEntries.map((entry) => (
          <TimelineCard entry={entry} key={entry.id} />
        ))}
      </div>
      <Card className="insight-panel">
        <Badge tone="success">Pattern</Badge>
        <h2>Higher severity appears near poor sleep logs</h2>
        <p>
          The dashboard shell is ready for real API data once backend timeline endpoints are added.
        </p>
      </Card>
    </section>
  </div>
);
