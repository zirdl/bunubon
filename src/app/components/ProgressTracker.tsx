import { Check } from 'lucide-react';

export interface ProgressCheckpoint {
  id: string;
  label: string;
  completed: boolean;
}

interface ProgressTrackerProps {
  checkpoints: ProgressCheckpoint[];
  onToggle?: (checkpointId: string) => void;
  readOnly?: boolean;
}

export function ProgressTracker({ checkpoints, onToggle, readOnly = false }: ProgressTrackerProps) {
  const completedCount = checkpoints.filter(cp => cp.completed).length;
  const progressPercentage = (completedCount / checkpoints.length) * 100;

  return (
    <div className="space-y-3">
      {/* Checkpoints */}
      <div className="space-y-3">
        {checkpoints.map((checkpoint) => (
          <div
            key={checkpoint.id}
            className="flex items-center gap-3"
          >
            <button
              type="button"
              onClick={() => !readOnly && onToggle?.(checkpoint.id)}
              disabled={readOnly}
              className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                checkpoint.completed
                  ? 'bg-emerald-600 border-emerald-600'
                  : 'bg-white border-gray-300'
              } ${!readOnly ? 'cursor-pointer hover:border-emerald-400' : 'cursor-default'}`}
            >
              {checkpoint.completed && (
                <Check className="w-4 h-4 text-white" />
              )}
            </button>
            <span className={`text-sm ${checkpoint.completed ? 'text-gray-900' : 'text-gray-600'}`}>
              {checkpoint.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}