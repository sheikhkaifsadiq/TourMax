import PageShell from "@/components/PageShell";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Globe, Heart, Sparkles, Users, Award, Compass } from "lucide-react";

const values = [
  { icon: Globe, title: "Global Reach", text: "Curated experiences across 80+ countries with trusted local partners." },
  { icon: Heart, title: "Travel With Purpose", text: "We support sustainable tourism and communities at every destination." },
  { icon: Sparkles, title: "AI-Powered", text: "Personalized recommendations that learn from your unique travel style." },
  { icon: Users, title: "Real People", text: "A team of seasoned travelers available 24/7 to support your journey." },
  { icon: Award, title: "Award Winning", text: "Recognized by leading travel publications for service and quality." },
  { icon: Compass, title: "Handpicked Tours", text: "Every itinerary is vetted by our experts before it reaches you." },
];

export default function About() {
  return (
    <PageShell>
      <PageHeader
        badge="✨ Our Story"
        title="Crafting Journeys"
        highlight="That Matter"
        description="TourMax was born from a simple belief — travel should feel personal, effortless, and unforgettable."
      />

      <section className="py-20 bg-white">
        <div className="container px-4 mx-auto max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Who we are</h2>
          <p className="text-lg text-slate-600 leading-relaxed mb-4">
            Since 2020, TourMax has helped thousands of travelers discover unforgettable
            destinations. We blend AI-driven personalization with the warmth of human
            curation to design tours you'll talk about for years.
          </p>
          <p className="text-lg text-slate-600 leading-relaxed">
            From sunrise treks in Patagonia to candle-lit dinners in Kyoto, we believe
            every traveler deserves a journey shaped around their story.
          </p>
        </div>
      </section>

      <section className="py-20 bg-slate-50">
        <div className="container px-4 mx-auto">
          <h2 className="text-4xl font-bold text-center text-slate-900 mb-12">What we stand for</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((v) => (
              <Card key={v.title} className="p-6 hover:shadow-lg transition border-slate-200">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center mb-4">
                  <v.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">{v.title}</h3>
                <p className="text-slate-600">{v.text}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-900 text-white">
        <div className="container px-4 mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { n: "80+", l: "Countries" },
            { n: "50k+", l: "Happy Travelers" },
            { n: "1.2k+", l: "Curated Tours" },
            { n: "4.9★", l: "Average Rating" },
          ].map((s) => (
            <div key={s.l}>
              <div className="text-4xl md:text-5xl font-bold text-blue-400 mb-2">{s.n}</div>
              <div className="text-slate-300">{s.l}</div>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
