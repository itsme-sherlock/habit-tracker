import type { StreakData } from '../../utils/analytics';
import { Flame, Trophy, CalendarCheck } from 'lucide-react';

interface StreakCardProps {
  data: StreakData;
}

export function StreakCard({ data }: StreakCardProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="card p-4 text-center">
        <Flame className="w-8 h-8 text-orange-500 mx-auto mb-2" />
        <div className="text-3xl font-bold text-strong tabular-nums">{data.current}</div>
        <div className="text-xs text-muted mt-1">Current Streak</div>
        <div className="text-xs text-orange-500 mt-1">days</div>
      </div>

      <div className="card p-4 text-center">
        <Trophy className="w-8 h-8 text-amber-500 mx-auto mb-2" />
        <div className="text-3xl font-bold text-strong tabular-nums">{data.longest}</div>
        <div className="text-xs text-muted mt-1">Longest Streak</div>
        <div className="text-xs text-amber-500 mt-1">days</div>
      </div>

      <div className="card p-4 text-center">
        <CalendarCheck className="w-8 h-8 text-green-500 mx-auto mb-2" />
        <div className="text-3xl font-bold text-strong tabular-nums">{data.totalActiveDays}</div>
        <div className="text-xs text-muted mt-1">Total Active Days</div>
        <div className="text-xs text-green-500 mt-1">tracked</div>
      </div>
    </div>
  );
}