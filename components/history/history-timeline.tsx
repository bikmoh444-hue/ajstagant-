import type { HistoryStep } from '@/lib/types/pages';
import { visibleInOrder } from '@/lib/utils/content';

export function HistoryTimeline({ steps }: { steps: HistoryStep[] }) {
  const visible = visibleInOrder(steps);
  if (!visible.length) return <p className="empty-state">Les étapes historiques seront publiées prochainement.</p>;
  return <ol className="history-timeline">{visible.map(step => <li key={step.id}>
    <span className="timeline-dot" aria-hidden="true" />
    <article className="timeline-card">{step.date && <p className="timeline-date">{step.date}</p>}
      <h3>{step.title}</h3><p>{step.description}</p>
      {step.is_demo && <span className="demo-label">Étape de démonstration</span>}
    </article>
  </li>)}</ol>;
}
