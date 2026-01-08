import { 
  SummaryStats, 
  TopGamesResponse, 
  TrendsResponse, 
  StreakStats, 
  HeatmapDay, 
  SearchResult, 
  GameDetails, 
  ComparisonData
} from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://steam-vault.onrender.com';

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!res.ok) {
        // Log purely for debugging, but throw to let caller handle
        console.error(`API Error ${res.status} for ${url}`);
        throw new Error(`HTTP error! status: ${res.status}`);
    }
    return res.json();
  } catch (error) {
    console.error(`Fetch error for ${url}:`, error);
    throw error;
  }
}

export async function getLatestSummary(): Promise<SummaryStats> {
  return fetchAPI<SummaryStats>('/demo/analytics/summary/latest', { next: { revalidate: 3600 } });
}

export async function getTopGames(period: string = 'week', page: number = 1, limit: number = 10): Promise<TopGamesResponse> {
  return fetchAPI<TopGamesResponse>(`/demo/analytics/top_games?period=${period}&page=${page}&limit=${limit}`, { cache: 'no-store' });
}

export async function getTrends(): Promise<TrendsResponse> {
  return fetchAPI<TrendsResponse>('/demo/analytics/trends', { next: { revalidate: 3600 } });
}

export async function getStreaks(appid?: number): Promise<StreakStats> {
  const query = appid ? `?appid=${appid}` : '';
  return fetchAPI<StreakStats>(`/demo/analytics/streaks${query}`, { next: { revalidate: 3600 } });
}

export async function getHeatmap(limitDays: number = 90): Promise<HeatmapDay[]> {
  return fetchAPI<HeatmapDay[]>(`/demo/analytics/activity/heatmap?limit_days=${limitDays}`, { next: { revalidate: 3600 } });
}

export async function searchGames(query: string): Promise<SearchResult[]> {
  if (!query || query.length < 2) return [];
  return fetchAPI<SearchResult[]>(`/demo/games/search?q=${encodeURIComponent(query)}`);
}

export async function getGameDetails(appid: number, days: number = 30): Promise<GameDetails> {
  return fetchAPI<GameDetails>(`/demo/games/${appid}?days=${days}`);
}

export async function compareGames(appids: number[], days: number = 30): Promise<ComparisonData> {
  if (!appids.length) return {};
  const query = appids.map(id => `appids=${id}`).join('&');
  return fetchAPI<ComparisonData>(`/demo/analytics/games/compare?${query}`); // API ignores 'days' param in url? Current JS loads it client side filter?
  // Current JS: fetchAPI(\`/demo/analytics/games/compare?${params}\`);
  // And then filters by date locally: const recentDates = sortedDates.slice(-days);
  // So the API returns full history? Or default?
  // I will check the JS again.
  // JS: `const data = await fetchAPI(\`/demo/analytics/games/compare?${params}\`);`
  // JS: `const recentDates = sortedDates.slice(-days);`
  // So the filtering is client side.
}
