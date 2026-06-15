import PageShell from "@/components/PageShell";
import PageHeader from "@/components/PageHeader";

const sections = [
  { h: "1. Acceptance of Terms", p: "By accessing or using TourMax, you agree to these Terms of Service. If you do not agree, please do not use our platform." },
  { h: "2. Booking & Payment", p: "All bookings are subject to availability and confirmation. Payment is required at the time of booking unless otherwise noted." },
  { h: "3. Cancellations & Refunds", p: "Cancellation policies vary by tour and are listed on each tour page. Refunds are processed within 7-14 business days." },
  { h: "4. User Conduct", p: "You agree to use TourMax lawfully and respectfully, and not to misuse our services or interfere with other users." },
  { h: "5. Travel Documents", p: "It is your responsibility to ensure you hold valid passports, visas, and any other documentation required for your destination." },
  { h: "6. Liability", p: "TourMax acts as an intermediary between travelers and tour operators. Our liability is limited to the value of the booking made." },
  { h: "7. Governing Law", p: "These terms are governed by the laws of the State of New York, USA." },
];

export default function Terms() {
  return (
    <PageShell>
      <PageHeader
        badge="📄 Legal"
        title="Terms of"
        highlight="Service"
        description="Last updated: May 1, 2026 — The ground rules for using TourMax."
      />

      <section className="py-20 bg-white">
        <div className="container px-4 mx-auto max-w-3xl space-y-8">
          {sections.map((s) => (
            <div key={s.h}>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">{s.h}</h2>
              <p className="text-slate-600 leading-relaxed">{s.p}</p>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
