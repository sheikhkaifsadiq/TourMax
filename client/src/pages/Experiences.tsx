import { useMemo, useState } from "react";
import PageShell from "@/components/PageShell";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Star, MapPin, Clock, Users, Search } from "lucide-react";
import {
  EXPERIENCES,
  EXPERIENCE_CATEGORIES,
  type Experience,
} from "@/data/experiences";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function Experiences() {
  const [category, setCategory] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Experience | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return EXPERIENCES.filter((e) => {
      if (category !== "all" && e.category !== category) return false;
      if (!q) return true;
      return (
        e.title.toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q) ||
        e.host.toLowerCase().includes(q)
      );
    });
  }, [category, query]);

  return (
    <PageShell>
      <PageHeader
        badge="🎯 Experiences"
        title="Unforgettable"
        highlight="Local Experiences"
        description="Hosted by locals, vetted by us — from sunrise pasta classes to ice-cave hikes."
      />

      <section className="py-10 bg-slate-50 border-b border-slate-200 sticky top-16 z-30 backdrop-blur bg-slate-50/90">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col md:flex-row gap-4 md:items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search experiences, cities, hosts..."
                className="pl-9 h-11"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
              {EXPERIENCE_CATEGORIES.map((c) => (
                <Button
                  key={c.id}
                  size="sm"
                  variant={category === c.id ? "default" : "outline"}
                  className={
                    category === c.id
                      ? "bg-blue-600 hover:bg-blue-700 whitespace-nowrap"
                      : "whitespace-nowrap"
                  }
                  onClick={() => setCategory(c.id)}
                >
                  {c.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container px-4 mx-auto">
          {filtered.length === 0 ? (
            <p className="text-center text-slate-500 py-20">
              No experiences match your filters. Try clearing the search.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((e) => (
                <Card
                  key={e.id}
                  onClick={() => setSelected(e)}
                  className="overflow-hidden hover:shadow-xl transition cursor-pointer group border-slate-200"
                >
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={e.imageUrl}
                      alt={e.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <Badge className="absolute top-3 left-3 bg-white/95 text-slate-900 hover:bg-white capitalize">
                      {e.category}
                    </Badge>
                    <div className="absolute top-3 right-3 bg-white/95 rounded-full px-2 py-1 flex items-center gap-1 text-sm font-semibold text-slate-900">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {e.rating}
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-lg text-slate-900 mb-2 line-clamp-2">
                      {e.title}
                    </h3>
                    <div className="flex items-center gap-1 text-sm text-slate-500 mb-3">
                      <MapPin className="w-3.5 h-3.5" />
                      {e.location}
                    </div>
                    <div className="flex items-center justify-between text-sm text-slate-600 mb-3">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {e.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" /> {e.groupSize}
                      </span>
                    </div>
                    <div className="flex items-end justify-between pt-3 border-t border-slate-100">
                      <div className="text-xs text-slate-500">
                        Hosted by{" "}
                        <span className="text-slate-700 font-medium">
                          {e.host}
                        </span>
                      </div>
                      <div>
                        <span className="text-xl font-bold text-slate-900">
                          ${e.price}
                        </span>
                        <span className="text-sm text-slate-500"> / person</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selected && (
            <>
              <img
                src={selected.imageUrl}
                alt={selected.title}
                className="w-full h-64 object-cover rounded-md"
              />
              <DialogHeader>
                <DialogTitle className="text-2xl">{selected.title}</DialogTitle>
                <DialogDescription className="flex items-center gap-3 text-base">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" /> {selected.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    {selected.rating} ({selected.reviewCount} reviews)
                  </span>
                </DialogDescription>
              </DialogHeader>
              <p className="text-slate-700">{selected.description}</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-slate-500">Duration</div>
                  <div className="font-medium">{selected.duration}</div>
                </div>
                <div>
                  <div className="text-slate-500">Group size</div>
                  <div className="font-medium">{selected.groupSize}</div>
                </div>
                <div>
                  <div className="text-slate-500">Languages</div>
                  <div className="font-medium">{selected.language}</div>
                </div>
                <div>
                  <div className="text-slate-500">Host</div>
                  <div className="font-medium">{selected.host}</div>
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900 mb-2">
                  What's included
                </div>
                <div className="flex flex-wrap gap-2">
                  {selected.highlights.map((h) => (
                    <Badge key={h} variant="secondary">
                      {h}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t">
                <div>
                  <span className="text-2xl font-bold">${selected.price}</span>
                  <span className="text-slate-500"> / person</span>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Reserve a spot
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
