import { useState } from "react";
import PageShell from "@/components/PageShell";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sparkles, MapPin, Calendar, Users, Sun, Sunset, Moon, Lightbulb } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

type Day = {
  day: number;
  title: string;
  morning: string;
  afternoon: string;
  evening: string;
  tip: string;
};

type Itinerary = {
  summary: string;
  estimatedBudgetUsd: number;
  days: Day[];
};

const INTERESTS = [
  "Food",
  "Culture",
  "Adventure",
  "Nightlife",
  "Nature",
  "History",
  "Shopping",
  "Wellness",
  "Photography",
  "Hidden gems",
];

const BUDGETS = [
  { id: "budget" as const, label: "Budget", note: "Hostels, street food" },
  { id: "comfort" as const, label: "Comfort", note: "Mid-range hotels" },
  { id: "luxury" as const, label: "Luxury", note: "Boutique & fine dining" },
];

export default function Plan() {
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState(5);
  const [travelers, setTravelers] = useState(2);
  const [budget, setBudget] = useState<"budget" | "comfort" | "luxury">("comfort");
  const [interests, setInterests] = useState<string[]>(["Food", "Culture"]);
  const [notes, setNotes] = useState("");
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);

  const generate = trpc.planner.generate.useMutation({
    onSuccess: (data) => {
      setItinerary(data as Itinerary);
      toast.success("Your AI-crafted itinerary is ready!");
      setTimeout(() => {
        document.getElementById("itinerary")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    },
    onError: (err) => toast.error(err.message),
  });

  const toggleInterest = (i: string) =>
    setInterests((prev) =>
      prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i].slice(0, 6),
    );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination.trim()) {
      toast.error("Tell us where you'd like to go.");
      return;
    }
    setItinerary(null);
    generate.mutate({ destination: destination.trim(), days, travelers, interests, budget, notes: notes.trim() || undefined });
  };

  return (
    <PageShell>
      <PageHeader
        badge="✨ AI Trip Planner"
        title="Your Perfect Trip,"
        highlight="Planned in Seconds"
        description="Tell us where, when, and what you love — our AI builds a personalized day-by-day itinerary."
      />

      <section className="py-16 bg-gradient-to-b from-slate-50 to-white">
        <div className="container px-4 mx-auto max-w-3xl">
          <Card className="p-6 md:p-8 border-slate-200 shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  <MapPin className="inline w-4 h-4 mr-1" /> Destination
                </label>
                <Input
                  placeholder="e.g. Lisbon, Portugal"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="h-12 text-base"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    <Calendar className="inline w-4 h-4 mr-1" /> Days
                  </label>
                  <Input
                    type="number"
                    min={1}
                    max={30}
                    value={days}
                    onChange={(e) => setDays(Math.max(1, Math.min(30, parseInt(e.target.value) || 1)))}
                    className="h-12"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    <Users className="inline w-4 h-4 mr-1" /> Travelers
                  </label>
                  <Input
                    type="number"
                    min={1}
                    max={20}
                    value={travelers}
                    onChange={(e) => setTravelers(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
                    className="h-12"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-3">Budget tier</label>
                <div className="grid grid-cols-3 gap-3">
                  {BUDGETS.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setBudget(b.id)}
                      className={`p-3 rounded-lg border-2 text-left transition ${
                        budget === b.id
                          ? "border-blue-600 bg-blue-50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="font-semibold text-sm text-slate-900">{b.label}</div>
                      <div className="text-xs text-slate-500">{b.note}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-3">
                  Interests <span className="text-slate-500 font-normal">(pick up to 6)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {INTERESTS.map((i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => toggleInterest(i)}
                      className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
                        interests.includes(i)
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-slate-700 border-slate-200 hover:border-slate-400"
                      }`}
                    >
                      {i}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Anything else? <span className="text-slate-500 font-normal">(optional)</span>
                </label>
                <textarea
                  className="w-full min-h-[80px] rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. traveling with kids, vegetarian, mobility considerations..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  maxLength={500}
                />
              </div>

              <Button
                type="submit"
                disabled={generate.isPending}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-base"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {generate.isPending ? "Crafting your itinerary..." : "Generate my itinerary"}
              </Button>
            </form>
          </Card>
        </div>
      </section>

      {itinerary && (
        <section id="itinerary" className="py-16 bg-white border-t border-slate-200">
          <div className="container px-4 mx-auto max-w-3xl">
            <div className="mb-8 text-center">
              <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 mb-3">
                AI-generated itinerary
              </Badge>
              <h2 className="text-3xl font-bold text-slate-900 mb-3">
                {days} days in {destination}
              </h2>
              <p className="text-slate-600 max-w-2xl mx-auto">{itinerary.summary}</p>
              {itinerary.estimatedBudgetUsd > 0 && (
                <p className="mt-3 text-sm text-slate-500">
                  Estimated budget:{" "}
                  <span className="font-semibold text-slate-900">
                    ${itinerary.estimatedBudgetUsd.toLocaleString()} USD per person
                  </span>
                </p>
              )}
            </div>

            <div className="space-y-5">
              {itinerary.days.map((d) => (
                <Card key={d.day} className="p-6 border-slate-200">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="shrink-0 w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center text-white font-bold">
                      {d.day}
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">
                        Day {d.day}
                      </div>
                      <h3 className="text-xl font-bold text-slate-900">{d.title}</h3>
                    </div>
                  </div>

                  <div className="grid gap-3 text-sm">
                    <Block icon={<Sun className="w-4 h-4 text-amber-500" />} label="Morning" text={d.morning} />
                    <Block icon={<Sunset className="w-4 h-4 text-orange-500" />} label="Afternoon" text={d.afternoon} />
                    <Block icon={<Moon className="w-4 h-4 text-indigo-500" />} label="Evening" text={d.evening} />
                  </div>

                  {d.tip && (
                    <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md flex gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div className="text-sm text-slate-700">
                        <span className="font-semibold text-amber-700">Local tip: </span>
                        {d.tip}
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}
    </PageShell>
  );
}

function Block({ icon, label, text }: { icon: React.ReactNode; label: string; text: string }) {
  return (
    <div className="flex gap-3 p-3 bg-slate-50 rounded-md">
      <div className="shrink-0 mt-0.5">{icon}</div>
      <div>
        <div className="font-semibold text-slate-900 text-xs uppercase tracking-wide">{label}</div>
        <div className="text-slate-700 mt-0.5">{text}</div>
      </div>
    </div>
  );
}
