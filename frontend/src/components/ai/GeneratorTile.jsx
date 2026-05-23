import { Wand2 } from 'lucide-react';

import { Button } from '../common/Button.jsx';
import { Card } from '../common/Card.jsx';

export const GeneratorTile = ({ description, icon: Icon, isGenerating, label, onGenerate }) => (
  <Card interactive>
    <Card.Body className="flex h-full flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
          <Icon aria-hidden="true" size={16} />
        </span>
        <Card.Title as="h3">{label}</Card.Title>
      </div>
      <p className="m-0 flex-1 text-sm text-muted">{description}</p>
      <div className="flex justify-end">
        <Button icon={Wand2} isLoading={isGenerating} onClick={onGenerate} variant="ai">
          Generate
        </Button>
      </div>
    </Card.Body>
  </Card>
);
