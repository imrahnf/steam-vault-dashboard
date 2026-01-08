import { SummarySection } from "../components/dashboard/SummarySection";
import { TopGamesSection } from "../components/dashboard/TopGamesSection";
import { TrendsSection } from "../components/dashboard/TrendsSection";
import { StreaksSection } from "../components/dashboard/StreaksSection";
import { HeatmapSection } from "../components/dashboard/HeatmapSection";
import { SearchAndCompareSection } from "../components/dashboard/SearchAndCompareSection";

export default function Home() {
  return (
    <div className="space-y-8">
      <SummarySection />
      
      <TopGamesSection />
      
      <TrendsSection />
      
      <StreaksSection />
      
      <HeatmapSection />
      
      <SearchAndCompareSection />
    </div>
  );
}
