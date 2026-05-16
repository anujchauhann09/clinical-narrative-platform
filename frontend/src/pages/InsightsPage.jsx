import { Card } from '../components/index.js';

export const InsightsPage = () => (
  <div className="page">
    <header className="page-header">
      <div>
        <p className="eyebrow">AI summaries</p>
        <h1>Insights</h1>
      </div>
    </header>
    <Card>
      <h2>Clinical summary workspace</h2>
      <p>AI-generated doctor briefs and pattern summaries will live here.</p>
    </Card>
  </div>
);
