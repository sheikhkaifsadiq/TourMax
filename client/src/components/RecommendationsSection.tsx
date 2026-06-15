import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Sparkles } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { RECOMMENDED_TOURS } from "@/data/featuredTours";
import { useResponsiveCount } from "@/hooks/useResponsiveCount";

interface RecommendationsSectionProps {
  sessionId: string;
}

export default function RecommendationsSection({ sessionId }: RecommendationsSectionProps) {
  const visibleCount = useResponsiveCount();
  const isLoading = false;

  // Personalized list always uses the curated RECOMMENDED_TOURS dataset so
  // it stays distinct from Featured Tours. Ranking algorithm: sort by
  // (rating desc, reviewCount desc) — the "most loved personalized picks first".
  const sourceList = [...RECOMMENDED_TOURS].sort((a, b) => {
    const ra = parseFloat(a.rating);
    const rb = parseFloat(b.rating);
    if (rb !== ra) return rb - ra;
    return b.reviewCount - a.reviewCount;
  });

  const recommendations = sourceList.slice(0, visibleCount);

  return (
    <section id="recommendations" className="py-20 bg-gradient-to-b from-slate-50 to-white">
      <div className="container px-4 mx-auto">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 text-blue-600" />
            <h2 className="text-4xl font-bold text-slate-900">Personalized Recommendations</h2>
          </div>
          <p className="text-lg text-slate-600">
            Discover tours tailored to your interests and travel style
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(visibleCount)].map((_, i) => (
              <div key={i} className="bg-slate-200 rounded-lg h-80 animate-pulse" />
            ))}
          </div>
        ) : recommendations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recommendations.map((tour: any) => (
              <Card
                key={tour.id}
                className="overflow-hidden hover:shadow-xl transition-shadow duration-300 group"
              >
                <div className="relative h-48 overflow-hidden bg-slate-200">
                  <img
                    src={tour.imageUrl}
                    alt={tour.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {tour.recommendationReason && (
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-blue-600 text-white text-xs">
                        For You
                      </Badge>
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2">
                    {tour.title}
                  </h3>

                  <div className="flex items-center gap-2 text-slate-600 mb-3">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{tour.destination}</span>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(parseFloat(tour.rating?.toString() || "0"))
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-slate-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-semibold text-slate-900">
                      {parseFloat(tour.rating?.toString() || "0").toFixed(1)}
                    </span>
                  </div>

                  {tour.recommendationReason && (
                    <p className="text-sm text-slate-600 mb-4 italic">
                      "{tour.recommendationReason}"
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                    <span className="text-2xl font-bold text-slate-900">
                      ${parseFloat(tour.price?.toString() || "0").toFixed(0)}
                    </span>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      Explore
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-600 mb-4">
              Explore more tours to get personalized recommendations
            </p>
            <Button className="bg-blue-600 hover:bg-blue-700">Browse All Tours</Button>
          </div>
        )}
      </div>
    </section>
  );
}
