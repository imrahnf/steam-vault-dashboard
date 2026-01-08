'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { getTopGames } from '../../lib/api';
import { Game, TopGamesResponse } from '../../types';
import { formatMinutes } from '../../lib/utils';
import { GameDetailsModal } from './GameDetailsModal';
import { Trophy, ChevronLeft, ChevronRight, Loader2, BarChart2 } from 'lucide-react';

export function TopGamesSection() {
  const [period, setPeriod] = useState<string>('week');
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [data, setData] = useState<TopGamesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [selectedAppId, setSelectedAppId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, [period, page, limit]);

  const fetchData = () => {
    setLoading(true);
    getTopGames(period, page, limit)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handlePeriodChange = (value: string) => {
    setPeriod(value);
    setPage(1); // Reset to page 1 on period change
  };

  const handleGameClick = (appid: number) => {
    setSelectedAppId(appid);
    setIsModalOpen(true);
  };

  const startRank = (page - 1) * limit;

  return (
    <section className="mt-8">
      <Card className="bg-white/80 backdrop-blur-sm border-indigo-100 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
           <div className="space-y-1">
             <CardTitle className="text-xl text-gray-800 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-indigo-500" />
                Top Games
             </CardTitle>
             <CardDescription className="text-gray-500">
                Most played games by period
             </CardDescription>
           </div>
           
           <Tabs value={period} onValueChange={handlePeriodChange} className="w-auto">
              <TabsList className="bg-slate-100 border border-slate-200">
                <TabsTrigger value="week" className="data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm text-gray-500">Week</TabsTrigger>
                <TabsTrigger value="month" className="data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm text-gray-500">Month</TabsTrigger>
                <TabsTrigger value="lifetime" className="data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm text-gray-500">Lifetime</TabsTrigger>
              </TabsList>
            </Tabs>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col-reverse md:flex-row justify-between items-center gap-4 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
             {/* Pagination Controls */}
             <div className="flex items-center gap-2">
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1 || loading}
                    className="bg-white border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 text-gray-600"
                >
                    <ChevronLeft className="w-4 h-4 mr-1" /> Prev
                </Button>
                <div className="text-xs text-gray-500">
                    Page <span className="text-gray-900 font-bold">{page}</span> of {data?.total_pages || 1}
                </div>
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setPage(p => Math.min(data?.total_pages || 1, p + 1))}
                    disabled={!data || page === data.total_pages || loading}
                    className="bg-white border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 text-gray-600"
                >
                    Next <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
             </div>

             {/* Limit Selector */}
             <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Show:</span>
                <Select value={limit.toString()} onValueChange={(val) => { setLimit(parseInt(val)); setPage(1); }}>
                    <SelectTrigger className="w-[70px] h-8 bg-white border-slate-200 text-gray-700">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200 text-gray-700">
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                </Select>
             </div>
          </div>

          <div className="space-y-2 min-h-[400px]">
            {loading ? (
                 <div className="flex items-center justify-center h-40">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                 </div>
            ) : !data?.top_games?.length ? (
                <div className="text-center py-8 text-gray-500">No games found for this period.</div>
            ) : (
                data.top_games.map((game, index) => (
                    <div 
                        key={game.appid}
                        onClick={() => handleGameClick(game.appid)}
                        className="group flex items-center justify-between p-3 rounded-lg bg-white border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50 cursor-pointer transition-all shadow-sm hover:shadow-md"
                    >
                        <div className="flex items-center gap-4">
                            <span className="w-8 text-center text-indigo-500 font-bold text-sm">#{startRank + index + 1}</span>
                            {game.img_icon_url && (
                                <img src={game.img_icon_url} alt={game.name} className="w-8 h-8 rounded bg-gray-100" />
                            )}
                            <span className="font-medium text-gray-700 group-hover:text-indigo-700 truncate max-w-[150px] md:max-w-md">{game.name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500 group-hover:text-indigo-600">
                           <BarChart2 className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                           <span className="font-mono font-medium">{formatMinutes(game.total_playtime || 0)}</span>
                        </div>
                    </div>
                ))
            )}
          </div>
        </CardContent>
      </Card>

      <GameDetailsModal 
        appid={selectedAppId} 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen} 
      />
    </section>
  );
}
