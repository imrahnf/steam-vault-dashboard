'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { getTrends } from '../../lib/api';
import { TrendsResponse } from '../../types';
import { formatMinutes } from '../../lib/utils';
import { TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

export function TrendsSection() {
  const [data, setData] = useState<TrendsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTrends()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Skeleton className="h-[250px] w-full bg-indigo-50/50 rounded-xl" />;
  if (!data) return null;

  const change = parseFloat(data.trends.change_vs_last_week);
  const isPositive = change >= 0;

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-indigo-100 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl text-gray-800 flex items-center gap-2">
           <TrendingUp className="w-5 h-5 text-indigo-500" />
           14-Day Trends
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <TrendBox label="This Week" value={formatMinutes(data.trends.this_week.total_playtime)} />
            <TrendBox label="Last Week" value={formatMinutes(data.trends.last_week.total_playtime)} />
            
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-lg flex flex-col justify-center items-center text-center">
                 <span className="text-gray-500 text-sm mb-1">Change</span>
                 <div className={`text-2xl font-bold flex items-center gap-1 ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {isPositive ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownRight className="w-6 h-6" />}
                    {data.trends.change_vs_last_week}
                 </div>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TrendBox({ label, value }: { label: string; value: string }) {
    return (
        <div className="bg-slate-50 border border-slate-100 p-4 rounded-lg text-center flex flex-col justify-center">
            <span className="text-gray-500 text-sm mb-1">{label}</span>
            <span className="text-2xl font-bold text-gray-800">{value}</span>
        </div>
    )
}
