'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { searchGames, compareGames } from '../../lib/api';
import { SearchResult, ComparisonData } from '../../types';
import { formatMinutes, formatDate } from '../../lib/utils';
import { Search, Plus, BarChart2, X, Info } from 'lucide-react';
import { GameDetailsModal } from './GameDetailsModal';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface ComparisonGame {
  appid: number;
  name: string;
}

export function SearchAndCompareSection() {
  const [comparisonGames, setComparisonGames] = useState<ComparisonGame[]>([]);
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);
  const [days, setDays] = useState<number>(30);
  const [loadingComparison, setLoadingComparison] = useState(false);

  // Search State
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState<number | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const handleSearch = (val: string) => {
    setQuery(val);
    if (val.length < 2) {
      setResults([]);
      return;
    }
    
    // Debounce could be added here, but for now direct call with a slight delay or just on input
    // The original app used 300ms timeout
    const timeoutId = setTimeout(() => {
        setIsSearching(true);
        searchGames(val)
        .then(setResults)
        .catch(console.error)
        .finally(() => setIsSearching(false));
    }, 300);
    return () => clearTimeout(timeoutId);
  };

  const addToComparison = (game: SearchResult) => {
    if (comparisonGames.find(g => g.appid === game.appid)) return;
    if (comparisonGames.length >= 5) {
        alert("Max 5 games");
        return;
    }
    setComparisonGames([...comparisonGames, { appid: game.appid, name: game.name }]);
  };

  const removeFromComparison = (appid: number) => {
    setComparisonGames(comparisonGames.filter(g => g.appid !== appid));
  };

  const loadComparisonData = async () => {
    if (comparisonGames.length < 2) return;
    setLoadingComparison(true);
    try {
        const appids = comparisonGames.map(g => g.appid);
        const data = await compareGames(appids, days);
        setComparisonData(data);
    } catch (e) {
        console.error(e);
    } finally {
        setLoadingComparison(false);
    }
  };

  // Prepare chart data
  const chartData = (() => {
      if (!comparisonData) return [];
      
      const allDates = new Set<string>();
      Object.values(comparisonData).forEach(gameData => {
          gameData.forEach(entry => allDates.add(entry.date));
      });
      const sortedDates = Array.from(allDates).sort();
      const recentDates = sortedDates.slice(-days); // Client side filter as per original logic

      return recentDates.map(date => {
          const item: any = { date: formatDate(date) }; // Use formatted date for XAxis
          comparisonGames.forEach(game => {
             const gameData = comparisonData[game.appid];
             const dayData = gameData?.find(d => d.date === date);
             item[game.name] = dayData ? Math.round(dayData.playtime_forever / 60) : 0; // Hours
             item[`${game.name}_min`] = dayData ? dayData.playtime_forever : 0;
          });
          return item;
      });
  })();

  const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#10b981', '#f59e0b'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
      {/* Search Column */}
      <Card className="bg-white/80 backdrop-blur-sm border-indigo-100 shadow-sm lg:col-span-1">
        <CardHeader>
           <CardTitle className="text-xl text-gray-800 flex items-center gap-2">
              <Search className="w-5 h-5 text-indigo-500" />
              Search Games
           </CardTitle>
           <CardDescription className="text-gray-500">Find games to view or compare</CardDescription>
        </CardHeader>
        <CardContent>
           <div className="relative mb-4">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search for a game..."
                className="pl-9 bg-white border-slate-200 text-gray-800 placeholder:text-gray-400 focus-visible:ring-indigo-500"
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
              />
           </div>
           
           <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
               {isSearching ? <div className="text-center text-gray-500 py-4">Searching...</div> : 
                results.length > 0 ? (
                  results.map(game => (
                      <div key={game.appid} className="bg-slate-50 border border-slate-100 p-2 rounded-lg flex items-center justify-between group hover:bg-white hover:border-indigo-200 hover:shadow-sm transition-all">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                              {game.img_icon_url && <img src={game.img_icon_url} alt="" className="w-6 h-6 rounded bg-white" />}
                              <span className="text-sm font-medium text-gray-700 truncate">{game.name}</span>
                          </div>
                          <div className="flex items-center gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50" onClick={() => { setSelectedAppId(game.appid); setIsDetailsOpen(true); }} title="Details">
                                  <Info className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50" onClick={() => addToComparison(game)} title="Sample Compare">
                                  <Plus className="w-4 h-4" />
                              </Button>
                          </div>
                      </div>
                  ))
                ) : query.length >= 2 ? (
                    <div className="text-center text-gray-500 py-4">No results found</div>
                ) : null
               }
           </div>
        </CardContent>
      </Card>

      {/* Comparison Column */}
      <div className="lg:col-span-2 space-y-6">
         <Card className="bg-white/80 backdrop-blur-sm border-indigo-100 shadow-sm">
            <CardHeader>
                <CardTitle className="text-xl text-gray-800 flex items-center gap-2">
                    <BarChart2 className="w-5 h-5 text-indigo-500" />
                    Compare Games
                </CardTitle>
                <CardDescription className="text-gray-500">Select up to 5 games to compare recent playtime</CardDescription>
            </CardHeader>
            <CardContent>
                {/* Selected Games Chips */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {comparisonGames.length === 0 && <span className="text-sm text-gray-400 italic">No games selected</span>}
                    {comparisonGames.map(game => (
                        <div key={game.appid} className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm flex items-center gap-2 border border-indigo-100 shadow-sm">
                            {game.name}
                            <button onClick={() => removeFromComparison(game.appid)} className="text-indigo-400 hover:text-indigo-900 transition-colors">
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                </div>

                {/* Controls */}
                <div className="flex items-center gap-4 mb-6">
                    <Select value={days.toString()} onValueChange={(val) => setDays(parseInt(val))}>
                        <SelectTrigger className="w-[120px] bg-white border-slate-200 text-gray-600">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-slate-200 text-gray-600">
                            <SelectItem value="7">7 days</SelectItem>
                            <SelectItem value="14">14 days</SelectItem>
                            <SelectItem value="30">30 days</SelectItem>
                            <SelectItem value="60">60 days</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button 
                        onClick={loadComparisonData} 
                        disabled={comparisonGames.length < 2 || loadingComparison}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200"
                    >
                        {loadingComparison ? 'Loading...' : 'Compare Games'}
                    </Button>
                </div>

                {/* Chart */}
                {comparisonData && chartData.length > 0 ? (
                    <div className="h-[400px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} label={{ value: 'Hours', angle: -90, position: 'insideLeft', fill: '#94a3b8' }} />
                                <Tooltip 
                                    cursor={{ fill: '#f1f5f9' }}
                                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#1e293b', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value: number, name: string, props: any) => {
                                        const gameName = name;
                                        const minKey = `${gameName}_min`;
                                        const minutes = props.payload[minKey];
                                        return [`${value}h (${minutes}m)`, name];
                                    }}
                                />
                                <Legend />
                                {comparisonGames.map((game, index) => (
                                    <Bar key={game.appid} dataKey={game.name} fill={COLORS[index % COLORS.length]} radius={[4, 4, 0, 0]} />
                                ))}
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                ) : comparisonData ? (
                    <div className="text-center py-12 text-gray-400">No data available for comparison</div>
                ) : null}
            </CardContent>
         </Card>
      </div>

      <GameDetailsModal 
        appid={selectedAppId}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
      />
    </div>
  );
}
