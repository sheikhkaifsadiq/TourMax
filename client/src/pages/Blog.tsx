import PageShell from "@/components/PageShell";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const posts = [
  {
    title: "10 Hidden Gems in Southeast Asia You Need to Visit",
    excerpt: "Skip the crowds and discover the lesser-known wonders that locals love.",
    image: "https://images.unsplash.com/photo-1528127269322-539801943592?w=800&h=500&fit=crop",
    date: "May 28, 2026",
    category: "Asia",
  },
  {
    title: "A Foodie's Guide to Italy: Beyond Pizza and Pasta",
    excerpt: "From truffle hunts in Umbria to street food in Palermo — taste the real Italy.",
    image: "https://images.unsplash.com/photo-1533777324565-a040eb52facd?w=800&h=500&fit=crop",
    date: "May 18, 2026",
    category: "Food & Culture",
  },
  {
    title: "How AI Is Quietly Reshaping the Way We Travel",
    excerpt: "Smarter recommendations, smarter itineraries, more time enjoying the trip.",
    image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=500&fit=crop",
    date: "May 6, 2026",
    category: "Insights",
  },
  {
    title: "The Solo Traveler's Playbook for South America",
    excerpt: "Safety tips, must-see routes, and friendly hostels from Colombia to Patagonia.",
    image: "https://images.unsplash.com/photo-1526772662000-3f88f10405ff?w=800&h=500&fit=crop",
    date: "April 22, 2026",
    category: "Solo Travel",
  },
  {
    title: "Sustainable Tourism: Travel That Gives Back",
    excerpt: "How to choose experiences that support local communities and the planet.",
    image: "https://images.unsplash.com/photo-1500835556837-99ac94a94552?w=800&h=500&fit=crop",
    date: "April 10, 2026",
    category: "Sustainability",
  },
  {
    title: "Best Time to Visit Japan: A Seasonal Breakdown",
    excerpt: "Cherry blossoms, summer festivals, fall foliage, snow temples — pick your magic.",
    image: "https://images.unsplash.com/photo-1492571350019-22de08371fd3?w=800&h=500&fit=crop",
    date: "March 30, 2026",
    category: "Asia",
  },
];

export default function Blog() {
  return (
    <PageShell>
      <PageHeader
        badge="📖 Travel Blog"
        title="Stories &"
        highlight="Inspiration"
        description="Travel tips, destination guides, and stories from our community of explorers."
      />

      <section className="py-20 bg-white">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((p) => (
              <Card key={p.title} className="overflow-hidden hover:shadow-xl transition group border-slate-200">
                <div className="relative h-56 overflow-hidden">
                  <img src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  <Badge className="absolute top-4 left-4 bg-blue-600 hover:bg-blue-600">{p.category}</Badge>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
                    <Calendar className="w-4 h-4" />
                    {p.date}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2 leading-snug">{p.title}</h3>
                  <p className="text-slate-600 mb-4">{p.excerpt}</p>
                  <Button variant="ghost" className="px-0 text-blue-600 hover:text-blue-700 hover:bg-transparent">
                    Read more <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
