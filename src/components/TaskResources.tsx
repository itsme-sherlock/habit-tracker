import { ExternalLink } from 'lucide-react';
import type { StudyTask } from '../types';
import { getTaskResources } from '../data/resources';

export function TaskResources({ task }: { task: StudyTask }) {
  const resources = getTaskResources(task);
  if (resources.length === 0) return null;

  return (
    <ul className="mt-3 flex flex-col gap-2" aria-label="Resources">
      {resources.map(r => (
        <li key={r.url}>
          <a href={r.url} target="_blank" rel="noopener noreferrer" className="resource-link">
            <span className="truncate">{r.label}</span>
            <ExternalLink className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
