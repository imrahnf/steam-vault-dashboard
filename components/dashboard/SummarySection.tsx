'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { getLatestSummary } from '../../lib/api';
import { SummaryStats } from '../../types';
import { formatMinutes, formatDate } from '../../lib/utils';
import { Trophy, Clock, Gamepad, Activity, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

export function SummarySection() {
  const [data, setData] = useState<SummaryStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLatestSummary()
      .then(setData)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <SummarySkeleton />;
  }

  if (!data) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6 text-center text-red-600">
          Failed to load summary data.
        </CardContent>
      </Card>
    );
  }

  return (
    <section>
      <h2 className="text-2xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
        <Activity className="w-6 h-6 text-indigo-500" />
        Latest Summary
      </h2>
      <Card className="bg-white/80 backdrop-blur-sm border-indigo-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-500 font-normal text-sm">
            Daily Overview for <span className="text-gray-900 font-medium">{formatDate(data.date)}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            <StatItem 
              label="Total Playtime" 
              value={formatMinutes(data.total_playtime_minutes)} 
              icon={<Clock className="w-4 h-4 text-indigo-500" />}
            />
            <StatItem 
              label="Games Tracked" 
              value={data.total_games_tracked.toString()} 
              icon={<Gamepad className="w-4 h-4 text-indigo-500" />}
            />
             <StatItem 
              label="New Games" 
              value={data.new_games_count.toString()} 
              icon={<Calendar className="w-4 h-4 text-indigo-500" />}
            />
            <StatItem 
              label="Avg Playtime" 
              value={formatMinutes(Math.round(data.average_playtime_per_game))} 
              icon={<Activity className="w-4 h-4 text-indigo-500" />}
            />
            <div className="flex flex-col bg-slate-50 border border-slate-100 p-4 rounded-lg">
               <span className="text-gray-500 text-xs mb-1">vs Yesterday</span>
               <div className={`text-xl font-bold flex items-center gap-1 ${data.total_playtime_change >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {data.total_playtime_change >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  {data.total_playtime_change >= 0 ? '+' : ''}{formatMinutes(data.total_playtime_change)}
               </div>
            </div>
          </div>

          {data.most_played_name && (
            <div className="bg-gradient-to-r from-indigo-50 to-white border border-indigo-100 rounded-xl p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-white p-3 rounded-full shadow-sm border border-indigo-50">
                  <Trophy className="w-6 h-6 text-indigo-500" />
                </div>
                <div>
                  <h3 className="text-gray-500 text-sm uppercase tracking-wider font-semibold">Most Played Today</h3>
                  <p className="text-gray-900 text-xl font-bold mt-1">{data.most_played_name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-indigo-600 text-3xl font-bold">{formatMinutes(data.most_played_minutes || 0)}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

function StatItem({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="flex flex-col bg-white border border-slate-100 p-4 rounded-lg transition-all hover:shadow-md duration-200">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-gray-500 text-xs">{label}</span>
      </div>
      <span className="text-xl font-bold text-gray-900">{value}</span>
    </div>
  );
}

function SummarySkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48 bg-slate-200" />
      <Card className="bg-white/50 border-white/50">
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-24 bg-slate-200 rounded-lg" />
            ))}
          </div>
          <Skeleton className="h-24 bg-slate-200 rounded-xl w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
