export interface SummaryStats {
  date: string;
  total_playtime_minutes: number;
  total_games_tracked: number;
  new_games_count: number;
  average_playtime_per_game: number;
  total_playtime_change: number;
  most_played_name?: string;
  most_played_minutes?: number;
}

export interface Game {
  appid: number;
  name: string;
  img_icon_url?: string;
  playtime_forever?: number; // In minutes, sometimes present in various endpoints
  total_playtime?: number; // In minutes, sometimes 'total_playtime'
}

export interface TopGamesResponse {
  top_games: Game[];
  total: number;
  total_pages: number;
  page: number;
  limit: number;
}

export interface TrendStats {
  total_playtime: number;
}

export interface TrendsResponse {
  trends: {
    this_week: TrendStats;
    last_week: TrendStats;
    change_vs_last_week: string; // "123" or "-123"
  };
}

export interface StreakStats {
  current_streak: number;
  longest_streak: number;
  name?: string; // For per-game streak
}

export interface HeatmapDay {
  date: string; // YYYY-MM-DD
  total_playtime: number;
  games_played: number;
}

export interface GameHistoryItem {
  date: string;
  playtime_forever: number;
}

export interface GameDetails extends Game {
  history: GameHistoryItem[];
}

export interface SearchResult {
  appid: number;
  name: string;
  img_icon_url?: string;
}

export interface ComparisonData {
  [appid: string]: {
    date: string;
    playtime_forever: number;
  }[];
}
