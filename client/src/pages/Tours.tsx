import { useMemo, useState } from "react";
import PageShell from "@/components/PageShell";
import PageHeader from "@/components/PageHeader";
import SearchBar from "@/components/SearchBar";
import TourGrid from "@/components/TourGrid";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";

const ACTIVITY_TYPES = [
  "Adventure",
  "Cultural",
  "Wildlife",
  "Beach",
  "Hiking",
  "City Tour",
  "Food & Drink",
  "Cruise",
];

export default function Tours() {
  const [sessionId] = useState(
    () => `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  );

  const [destination, setDestination] = useState("");
  const [activityType, setActivityType] = useState<string>("any");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [accessibility, setAccessibility] = useState<string>("any");
  const [minHostResponseRate, setMinHostResponseRate] = useState<string>("");

  const [applied, setApplied] = useState({
    destination: "",
    activityType: "any",
    minPrice: "",
    maxPrice: "",
    accessibility: "any",
    minHostResponseRate: "",
  });

  const filtersActive =
    !!applied.destination ||
    applied.activityType !== "any" ||
    !!applied.minPrice ||
    !!applied.maxPrice ||
    applied.accessibility !== "any" ||
    !!applied.minHostResponseRate;

  const searchArgs = useMemo(
    () => ({
      destination: applied.destination || undefined,
      activityType:
        applied.activityType !== "any" ? applied.activityType : undefined,
      minPrice: applied.minPrice ? Number(applied.minPrice) : undefined,
      maxPrice: applied.maxPrice ? Number(applied.maxPrice) : undefined,
      accessibilityFeatures: applied.accessibility !== "any" ? [applied.accessibility] : undefined,
      minHostResponseRate: applied.minHostResponseRate ? Number(applied.minHostResponseRate) : undefined,
      limit: 48,
      offset: 0,
    }),
    [applied],
  );

  const listQuery = trpc.tours.list.useQuery(
    { limit: 24, offset: 0 },
    { enabled: !filtersActive },
  );
  const searchQuery = trpc.tours.search.useQuery(searchArgs, {
    enabled: filtersActive,
  });

  const tours = filtersActive ? searchQuery.data ?? [] : listQuery.data ?? [];
  const isLoading = filtersActive ? searchQuery.isLoading : listQuery.isLoading;

  const apply = () =>
    setApplied({ destination, activityType, minPrice, maxPrice, accessibility, minHostResponseRate });
  const reset = () => {
    setDestination("");
    setActivityType("any");
    setMinPrice("");
    setMaxPrice("");
    setAccessibility("any");
    setMinHostResponseRate("");
    setApplied({ destination: "", activityType: "any", minPrice: "", maxPrice: "", accessibility: "any", minHostResponseRate: "" });
  };

  return (
    <PageShell>
      <PageHeader
        badge="🌍 Explore"
        title="All Tours &"
        highlight="Experiences"
        description="Browse our full collection of carefully curated journeys across the globe."
      />

      <section className="py-12 bg-gradient-to-b from-slate-50 to-white">
        <div className="container px-4 mx-auto max-w-4xl">
          <SearchBar sessionId={sessionId} />
        </div>
      </section>

      <section className="py-8 bg-white border-b border-slate-100">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3 items-end">
            <div className="xl:col-span-1">
              <label className="text-xs font-medium text-slate-600">Destination</label>
              <Input
                placeholder="e.g. Bali"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              />
            </div>
            <div className="xl:col-span-1">
              <label className="text-xs font-medium text-slate-600">Activity</label>
              <Select value={activityType} onValueChange={setActivityType}>
                <SelectTrigger>
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  {ACTIVITY_TYPES.map((a) => (
                    <SelectItem key={a} value={a}>
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="xl:col-span-1">
              <label className="text-xs font-medium text-slate-600">Min Price ($)</label>
              <Input
                type="number"
                min="0"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
            </div>
            <div className="xl:col-span-1">
              <label className="text-xs font-medium text-slate-600">Max Price ($)</label>
              <Input
                type="number"
                min="0"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
            <div className="xl:col-span-1">
              <label className="text-xs font-medium text-slate-600">Accessibility</label>
              <Select value={accessibility} onValueChange={setAccessibility}>
                <SelectTrigger>
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="Wheelchair Accessible">Wheelchair</SelectItem>
                  <SelectItem value="No Stairs">No Stairs</SelectItem>
                  <SelectItem value="Sign Language">Sign Language</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="xl:col-span-1">
              <label className="text-xs font-medium text-slate-600">Response Rate %</label>
              <Input
                type="number"
                min="0"
                max="100"
                placeholder="e.g. 90"
                value={minHostResponseRate}
                onChange={(e) => setMinHostResponseRate(e.target.value)}
              />
            </div>
            <div className="flex gap-2 xl:col-span-1">
              <Button onClick={apply} className="bg-blue-600 hover:bg-blue-700 flex-1">
                Apply
              </Button>
              <Button onClick={reset} variant="outline">
                Reset
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container px-4 mx-auto">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-slate-200 rounded-lg h-96 animate-pulse" />
              ))}
            </div>
          ) : tours.length === 0 ? (
            <div className="text-center py-16 text-slate-600">
              No tours match your filters. Try adjusting your search.
            </div>
          ) : (
            <TourGrid tours={tours} sessionId={sessionId} />
          )}
        </div>
      </section>
    </PageShell>
  );
}
