'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { getHeatmap } from '../../lib/api';
import { HeatmapDay } from '../../types';
import { formatMinutes, formatDate } from '../../lib/utils';
import { Calendar, Info } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

export function HeatmapSection() {
    const [days, setDays] = useState<number>(60);
  const [data, setData] = useState<HeatmapDay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getHeatmap(days)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [days]);

  // Process data
  const maxPlaytime = Math.max(...(data.map(d => d.total_playtime) || [0]), 1);

  // Group by month
  const daysByMonth: { [key: string]: HeatmapDay[] } = {};
  data.forEach(day => {
       const [year, month] = day.date.split('-');
       const key = `${year}-${month}`;
       if (!daysByMonth[key]) daysByMonth[key] = [];
       daysByMonth[key].push(day);
  });

  // Sort months
  const sortedMonths = Object.keys(daysByMonth).sort(); // YYYY-MM is sortable string

  const getColor = (minutes: number) => {
      if (minutes === 0) return 'bg-slate-100'; 
      const intensity = minutes / maxPlaytime;
      if (intensity < 0.25) return 'bg-indigo-200';
      if (intensity < 0.5) return 'bg-indigo-400';
      if (intensity < 0.75) return 'bg-indigo-600';
      return 'bg-indigo-800';
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-indigo-100 shadow-sm mt-8">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
         <CardTitle className="text-xl text-gray-800 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-500" />
            Activity Heatmap
         </CardTitle>
         <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Show last:</span>
            <Select value={days.toString()} onValueChange={(val) => setDays(parseInt(val))}>
                <SelectTrigger className="w-[100px] h-8 bg-white border-slate-200 text-gray-600">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200 text-gray-600">
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="60">60 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                    <SelectItem value="180">180 days</SelectItem>
                </SelectContent>
            </Select>
         </div>
      </CardHeader>
      <CardContent>
        {loading ? (
             <div className="h-[200px] flex items-center justify-center">
                 <Skeleton className="h-[150px] w-full bg-indigo-50" />
             </div>
        ) : (
            <TooltipProvider>
                <div className="flex flex-wrap gap-6 justify-center md:justify-start">
                    {sortedMonths.map(monthKey => {
                         const date = new Date(monthKey + '-02');
                         const monthName = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                         
                         return (
                             <div key={monthKey} className="flex flex-col gap-2">
                                 <h4 className="text-sm font-medium text-gray-500">{monthName}</h4>
                                 <div className="grid grid-rows-7 grid-flow-col gap-1">
                                     {daysByMonth[monthKey].map(day => (
                                         <Tooltip key={day.date} delayDuration={0}>
                                             <TooltipTrigger asChild>
                                                 <div 
                                                    className={`w-3 h-3 rounded-sm ${getColor(day.total_playtime)} hover:ring-2 ring-indigo-300 ring-offset-1 cursor-help transition-all`}
                                                 />
                                             </TooltipTrigger>
                                             <TooltipContent className="bg-white text-gray-800 border-indigo-100 shadow-xl p-3 z-50">
                                                 <p className="font-bold">{formatDate(day.date)}</p>
                                                 <p className="text-indigo-600 font-mono">{formatMinutes(day.total_playtime)}</p>
                                                 <p className="text-xs text-gray-500">{day.games_played} games played</p>
                                             </TooltipContent>
                                         </Tooltip>
                                     ))}
                                 </div>
                             </div>
                         )
                    })}
                </div>

                <div className="flex items-center gap-2 mt-6 text-xs text-gray-500">
                    <span>Less</span>
                    <div className="flex gap-1">
                        <div className="w-3 h-3 rounded-sm bg-slate-100"></div>
                        <div className="w-3 h-3 rounded-sm bg-indigo-200"></div>
                        <div className="w-3 h-3 rounded-sm bg-indigo-400"></div>
                        <div className="w-3 h-3 rounded-sm bg-indigo-600"></div>
                        <div className="w-3 h-3 rounded-sm bg-indigo-800"></div>
                    </div>
                    <span>More</span>
                </div>
            </TooltipProvider>
        )}
      </CardContent>
    </Card>
  );
}
