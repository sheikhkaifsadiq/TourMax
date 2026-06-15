import { useState } from "react";
import PageShell from "@/components/PageShell";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Sparkles, MapPin, Star, Trophy, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const PRIORITY_OPTIONS = [
  "Best value",
  "Adventure level",
  "Cultural depth",
  "Family-friendly",
  "Accessibility",
  "Photography",
  "Off-the-beaten-path",
];

export default function Compare() {
  const { data: tours = [] } = trpc.tours.list.useQuery({ limit: 24, offset: 0 });
  const [selected, setSelected] = useState<number[]>([]);
  const [priorities, setPriorities] = useState<string[]>(["Best value"]);
  const [result, setResult] = useState<any | null>(null);

  const compare = trpc.compare.summarize.useMutation({
    onSuccess: (data) => {
      setResult(data);
      setTimeout(() => document.getElementById("compare-result")?.scrollIntoView({ behavior: "smooth" }), 50);
    },
    onError: (err) => toast.error(err.message),
  });

  const toggleTour = (id: number) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : prev.length >= 4
          ? (toast.info("You can compare up to 4 tours"), prev)
          : [...prev, id],
    );
  };

  const togglePriority = (p: string) =>
    setPriorities((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p].slice(0, 6)));

  const handleCompare = () => {
    if (selected.length < 2) {
      toast.error("Pick at least 2 tours to compare");
      return;
    }
    setResult(null);
    compare.mutate({ tourIds: selected, priorities });
  };

  const tourById = (id: number) => result?.tours?.find((t: any) => t.id === id);

  return (
    <PageShell>
      <PageHeader
        badge="🤖 AI Comparison"
        title="Compare Tours"
        highlight="Side by Side"
        description="Pick 2-4 tours and let AI surface the best fit for your priorities."
      />

      <section className="py-12 bg-slate-50">
        <div className="container px-4 mx-auto max-w-6xl">
          <h2 className="text-xl font-bold text-slate-900 mb-4">1. Select tours</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {tours.map((t: any) => {
              const checked = selected.includes(t.id);
              return (
                <Card
                  key={t.id}
                  onClick={() => toggleTour(t.id)}
                  className={`p-3 cursor-pointer transition border-2 ${checked ? "border-blue-600 bg-blue-50" : "border-slate-200 hover:border-slate-300"}`}
                >
                  <div className="flex gap-3">
                    <Checkbox checked={checked} className="mt-1" />
                    <img src={t.imageUrl} alt={t.title} className="w-20 h-20 object-cover rounded" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 line-clamp-1">{t.title}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" /> {t.destination}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-sm font-semibold text-blue-600">${parseFloat(t.price).toFixed(0)}</span>
                        <span className="text-xs text-slate-600 flex items-center gap-0.5">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          {parseFloat(t.rating || "0").toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          <h2 className="text-xl font-bold text-slate-900 mb-3">2. Your priorities</h2>
          <div className="flex flex-wrap gap-2 mb-6">
            {PRIORITY_OPTIONS.map((p) => (
              <button
                key={p}
                onClick={() => togglePriority(p)}
                className={`px-4 py-2 rounded-full text-sm border transition ${priorities.includes(p) ? "bg-blue-600 text-white border-blue-600" : "bg-white border-slate-200 hover:border-slate-400"}`}
              >
                {p}
              </button>
            ))}
          </div>

          <Button
            onClick={handleCompare}
            disabled={compare.isPending || selected.length < 2}
            className="h-12 px-8 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
          >
            {compare.isPending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Comparing...</>
            ) : (
              <><Sparkles className="w-4 h-4 mr-2" /> Compare with AI ({selected.length})</>
            )}
          </Button>
        </div>
      </section>

      {result && (
        <section id="compare-result" className="py-16 bg-white">
          <div className="container px-4 mx-auto max-w-6xl">
            <Card className="p-6 mb-6 bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
              <Badge className="bg-blue-600 hover:bg-blue-600 mb-3">AI verdict</Badge>
              <p className="text-slate-900 text-lg leading-relaxed">{result.verdict}</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                {[
                  { label: "Best value", id: result.bestForBudget },
                  { label: "Best experience", id: result.bestForExperience },
                  { label: "Best for families", id: result.bestForFamilies },
                ].map((x) => {
                  const t = tourById(x.id);
                  return (
                    <div key={x.label} className="bg-white p-3 rounded-md border border-slate-200 flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-amber-500" />
                      <div>
                        <p className="text-xs text-slate-500">{x.label}</p>
                        <p className="font-semibold text-slate-900 text-sm">{t?.title || "—"}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="text-left p-3 bg-slate-100 sticky left-0">Criterion</th>
                    {result.tours.map((t: any) => (
                      <th key={t.id} className="text-left p-3 bg-slate-100 min-w-[200px]">{t.title}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map((row: any, idx: number) => (
                    <tr key={idx} className="border-b border-slate-200">
                      <td className="p-3 font-semibold text-slate-900 bg-slate-50 sticky left-0">{row.criterion}</td>
                      {result.tours.map((t: any) => {
                        const v = row.values.find((x: any) => x.tourId === t.id);
                        return <td key={t.id} className="p-3 text-slate-700 text-sm align-top">{v?.note || "—"}</td>;
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}
    </PageShell>
  );
}
