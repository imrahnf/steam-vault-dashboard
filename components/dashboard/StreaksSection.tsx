'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { getStreaks, getTopGames } from '../../lib/api';
import { StreakStats, Game } from '../../types';
import { Flame, Star, Trophy } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

interface GameStreak extends StreakStats {
    name: string;
    icon?: string;
}

export function StreaksSection() {
  const [overall, setOverall] = useState<StreakStats | null>(null);
  const [gameStreaks, setGameStreaks] = useState<GameStreak[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
        try {
            // 1. Overall Streaks
            const overallData = await getStreaks();
            setOverall(overallData);

            // 2. Top Games for Game Streaks
            const topGames = await getTopGames('lifetime', 1, 5);
            
            if (topGames?.top_games) {
                const streaksPromises = topGames.top_games.map(async (game) => {
                    try {
                        const s = await getStreaks(game.appid);
                        if (s.current_streak > 0 || s.longest_streak > 0) {
                            return {
                                ...s,
                                name: game.name,
                                icon: game.img_icon_url
                            } as GameStreak;
                        }
                    } catch (e) {
                        console.error(`Failed to load streaks for ${game.name}`, e);
                    }
                    return null;
                });
                
                const results = await Promise.all(streaksPromises);
                setGameStreaks(results.filter((r): r is GameStreak => r !== null));
            }

        } catch (error) {
            console.error("Failed to load streaks data", error);
        } finally {
            setLoading(false);
        }
    }
    fetchData();
  }, []);

  if (loading) {
      return (
          <Card className="bg-white/80 backdrop-blur-sm border-indigo-100 shadow-sm">
              <CardContent className="pt-6 text-center">
                  <Skeleton className="h-40 w-full bg-slate-100" />
              </CardContent>
          </Card>
      )
  }

  if (!overall) return null;

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-indigo-100 shadow-sm h-full">
      <CardHeader>
        <CardTitle className="text-xl text-gray-800 flex items-center gap-2">
           <Flame className="w-5 h-5 text-orange-500" />
           Play Streaks
        </CardTitle>
        <CardDescription className="text-gray-500">
            Consecutive days played
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 p-4 rounded-lg text-center border border-orange-100">
                <div className="text-gray-500 text-xs uppercase tracking-wider mb-2">Current Streak</div>
                <div className="text-3xl font-bold text-orange-500 flex items-center justify-center gap-2">
                    <Flame className="w-6 h-6 fill-current" />
                    {overall.current_streak}
                    <span className="text-sm font-normal text-gray-500 self-end mb-1">days</span>
                </div>
            </div>
             <div className="bg-gradient-to-br from-yellow-50 to-yellow-100/50 p-4 rounded-lg text-center border border-yellow-100">
                <div className="text-gray-500 text-xs uppercase tracking-wider mb-2">Longest Streak</div>
                <div className="text-3xl font-bold text-yellow-600 flex items-center justify-center gap-2">
                    <Star className="w-6 h-6 fill-current" />
                    {overall.longest_streak}
                    <span className="text-sm font-normal text-gray-500 self-end mb-1">days</span>
                </div>
            </div>
        </div>

        {gameStreaks.length > 0 && (
            <div>
                 <h3 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider">Top Game Streaks</h3>
                 <div className="space-y-3">
                     {gameStreaks.map((game, i) => (
                         <div key={i} className="bg-slate-50 p-3 rounded-lg flex items-center justify-between border border-slate-100 hover:bg-slate-100 transition-colors">
                             <div className="flex items-center gap-3">
                                {game.icon && <img src={game.icon} alt={game.name} className="w-8 h-8 rounded bg-white shadow-sm" />}
                                <span className="text-sm font-medium text-gray-700">{game.name}</span>
                             </div>
                             <div className="text-right">
                                 <div className="text-sm font-bold text-orange-500">{game.current_streak} days current</div>
                                 <div className="text-xs text-gray-400">{game.longest_streak} days max</div>
                             </div>
                         </div>
                     ))}
                 </div>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
