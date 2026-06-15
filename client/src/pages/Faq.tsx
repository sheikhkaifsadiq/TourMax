import PageShell from "@/components/PageShell";
import PageHeader from "@/components/PageHeader";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  { q: "How do I book a tour?", a: "Browse our tours, pick one you love, and click 'Book Now'. You'll be guided through dates, travelers, and payment — it takes under 2 minutes." },
  { q: "Can I customize an existing tour?", a: "Absolutely. Reach out via our contact page with the tour name and what you'd like adjusted, and a travel designer will build a custom itinerary for you." },
  { q: "What's your cancellation policy?", a: "Most tours offer full refunds up to 30 days before departure, and 50% up to 14 days prior. Each tour page lists its specific policy." },
  { q: "Are flights included?", a: "Tours include in-destination logistics (accommodation, local transport, guided activities). International flights are arranged separately, but we can help." },
  { q: "Do you offer travel insurance?", a: "We partner with a leading travel insurance provider — you can add coverage during checkout." },
  { q: "Is TourMax suitable for solo travelers?", a: "Yes. Many of our tours are popular with solo travelers, and we offer dedicated solo-friendly itineraries with no single supplement on select dates." },
  { q: "How does the AI recommendation work?", a: "Our AI analyzes your preferences, past searches, and travel style to surface tours you're most likely to love — and gets smarter the more you use TourMax." },
];

export default function Faq() {
  return (
    <PageShell>
      <PageHeader
        badge="❓ Help Center"
        title="Frequently Asked"
        highlight="Questions"
        description="Everything you need to know before booking your next journey with TourMax."
      />

      <section className="py-20 bg-white">
        <div className="container px-4 mx-auto max-w-3xl">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border border-slate-200 rounded-lg px-6 bg-white">
                <AccordionTrigger className="text-left text-lg font-semibold text-slate-900 hover:no-underline">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-slate-600 text-base leading-relaxed">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </PageShell>
  );
}
