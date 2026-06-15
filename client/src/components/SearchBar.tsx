import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import TourGrid from "@/components/TourGrid";
import { FEATURED_TOURS, RECOMMENDED_TOURS, type StaticTour } from "@/data/featuredTours";

interface SearchBarProps {
  sessionId: string;
  onResults?: (results: any[]) => void;
}

const QUICK_SEARCHES = [
  "Adventure in Patagonia",
  "Beach relaxation",
  "Cultural tours",
  "Luxury experiences",
];

const ALL_TOURS: StaticTour[] = [...FEATURED_TOURS, ...RECOMMENDED_TOURS];

function scoreTour(tour: StaticTour, tokens: string[]): number {
  const haystack = [
    tour.title,
    tour.destination,
    tour.activityType,
    tour.description,
    ...(tour.highlights || []),
  ]
    .join(" ")
    .toLowerCase();
  let score = 0;
  for (const t of tokens) {
    if (!t) continue;
    if (haystack.includes(t)) score += 1;
    if (tour.title.toLowerCase().includes(t)) score += 2;
    if (tour.destination.toLowerCase().includes(t)) score += 2;
    if (tour.activityType.toLowerCase().includes(t)) score += 1;
  }
  return score;
}

function localSearch(query: string): StaticTour[] {
  const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return [];
  const scored = ALL_TOURS.map((t) => ({ t, s: scoreTour(t, tokens) })).filter(
    (x) => x.s > 0,
  );
  scored.sort((a, b) => b.s - a.s);
  return scored.map((x) => x.t);
}

export default function SearchBar({ sessionId, onResults }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const runSearch = (q: string) => {
    if (!q.trim()) return;
    setIsSearching(true);
    // Small artificial delay so the UI feedback is visible
    setTimeout(() => {
      const r = localSearch(q.trim());
      setResults(r);
      setShowResults(true);
      onResults?.(r);
      setIsSearching(false);
      if (r.length === 0) {
        toast.info("No tours found matching your search. Try different keywords.");
      } else {
        toast.success(`Found ${r.length} tours`);
      }
    }, 150);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runSearch(query);
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-2 items-stretch">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
          <Input
            type="text"
            placeholder="Try: 'Adventure in Patagonia' or 'Beach vacation in Greece'"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-12 pl-10 text-base border-2 border-slate-200 focus:border-blue-500 rounded-lg"
          />
        </div>
        <Button
          type="submit"
          disabled={isSearching || !query.trim()}
          className="h-12 bg-blue-600 hover:bg-blue-700 px-6"
        >
          {isSearching ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Searching
            </>
          ) : (
            <>
              <Search className="w-4 h-4 mr-2" />
              Search
            </>
          )}
        </Button>
      </form>

      <div className="flex flex-wrap items-center gap-2 pt-1">
        <span className="text-sm text-slate-600 mr-1">Quick searches:</span>
        {QUICK_SEARCHES.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => {
              setQuery(suggestion);
              runSearch(suggestion);
            }}
            className="px-3 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-sm rounded-full transition"
          >
            {suggestion}
          </button>
        ))}
      </div>

      {showResults && (
        <div className="mt-6 space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-slate-700">
              Found <span className="font-semibold text-blue-600">{results.length}</span> tours matching your search
            </p>
          </div>
          {results.length > 0 && <TourGrid tours={results as any} sessionId={sessionId} />}
        </div>
      )}
    </div>
  );
}
