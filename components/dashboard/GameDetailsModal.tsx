'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog"
import { getGameDetails } from '../../lib/api';
import { GameDetails } from '../../types';
import { formatMinutes, formatDate } from '../../lib/utils';
import { Skeleton } from '../ui/skeleton';
import { ScrollArea } from '../ui/scroll-area';

interface GameDetailsModalProps {
  appid: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GameDetailsModal({ appid, open, onOpenChange }: GameDetailsModalProps) {
  const [game, setGame] = useState<GameDetails | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && appid) {
      setLoading(true);
      // Fetch 120 days to ensure we capture the demo data timeframe (likely ending Nov 2025)
      // even if current date is later
      getGameDetails(appid, 120)
        .then(setGame)
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
        setGame(null);
    }
  }, [open, appid]);

  const getTotalPlaytime = () => {
      if (!game) return 0;
      if (game.playtime_forever) return game.playtime_forever;
      if (game.history && game.history.length > 0) {
          return game.history[game.history.length - 1].playtime_forever;
      }
      return 0;
  };

  const getLast30DaysPlaytime = () => {
      if (!game || !game.history || game.history.length === 0) return 0;
      
      const history = game.history;
      const latest = history[history.length - 1];
      const latestDate = new Date(latest.date);
      
      // Target date is 30 days before the latest data point
      const targetDate = new Date(latestDate);
      targetDate.setDate(targetDate.getDate() - 30);
      
      // Find the history entry closest to 30 days ago (but not after the latest date)
      const pastEntry = history.find(h => new Date(h.date) >= targetDate);
      
      if (!pastEntry) return latest.playtime_forever; // If history < 30 days, assume 0 at start? Or just return total. 
                                                      // Actually if no entry >= target, it means all history is older? No.
                                                      // history is usually sorted ascending.
                                                      // If we find the *first* entry that is >= targetDate. 
                                                      // If history starts *after* targetDate, we take history[0].
      
      return latest.playtime_forever - pastEntry.playtime_forever;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white border-indigo-100 text-gray-800 shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2 text-indigo-700">
             {loading ? 'Loading...' : game?.name || 'Game Details'}
          </DialogTitle>
        </DialogHeader>
        
        {loading ? (
             <div className="space-y-4 py-4">
                 <Skeleton className="h-4 w-full bg-slate-100" />
                 <Skeleton className="h-20 w-full bg-slate-100" />
             </div>
        ) : game ? (
            <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <StatBox label="Total Playtime" value={formatMinutes(getTotalPlaytime())} />
                    <StatBox 
                        label="Last 30 Days" 
                        value={formatMinutes(getLast30DaysPlaytime())}
                    />
                     <StatBox 
                        label="Last Played" 
                         value={game.history && game.history.length > 0 
                            ? formatDate(game.history[game.history.length - 1].date)
                            : 'N/A'
                        }
                    />
                </div>

                {game.history && game.history.length > 0 && (
                     <div>
                        <h3 className="font-semibold mb-2 text-gray-500 text-sm uppercase tracking-wider">Recent History</h3>
                        <ScrollArea className="h-[200px] w-full rounded-md border border-slate-100 p-4 bg-slate-50">
                            <div className="space-y-2">
                                {game.history.slice().reverse().map((h, i) => (
                                    <div key={i} className="flex justify-between text-sm py-2 border-b border-slate-200 last:border-0 hover:bg-white px-2 rounded transition-colors">
                                        <span className="text-gray-600">{formatDate(h.date)}</span>
                                        <span className="font-mono font-medium text-indigo-600">{formatMinutes(h.playtime_forever)}</span>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                     </div>
                )}
            </div>
        ) : (
            <div className="text-center py-4 text-gray-400">Failed to load game details</div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
    return (
        <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg flex flex-col">
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">{label}</div>
            <div className="font-bold text-lg text-gray-800">{value}</div>
        </div>
    )
}
