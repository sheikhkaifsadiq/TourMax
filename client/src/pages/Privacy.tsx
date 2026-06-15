import PageShell from "@/components/PageShell";
import PageHeader from "@/components/PageHeader";

const sections = [
  { h: "1. Information We Collect", p: "We collect information you provide directly (name, email, payment details when booking) and information collected automatically (device, usage, cookies)." },
  { h: "2. How We Use Your Information", p: "To process bookings, personalize recommendations, communicate with you about your trips, improve our services, and comply with legal obligations." },
  { h: "3. Sharing Your Information", p: "We share data only with trusted partners required to fulfill your booking (tour operators, payment processors) and never sell your personal information." },
  { h: "4. Cookies & Tracking", p: "We use cookies to keep you signed in, remember preferences, and understand how the site is used. You can control cookies via your browser settings." },
  { h: "5. Data Security", p: "We use industry-standard encryption (TLS in transit, AES at rest) and strict access controls to protect your information." },
  { h: "6. Your Rights", p: "You may access, correct, export, or delete your data at any time by contacting privacy@tourmax.com." },
  { h: "7. Updates", p: "We may update this policy occasionally. Material changes will be communicated via email or a notice on the site." },
];

export default function Privacy() {
  return (
    <PageShell>
      <PageHeader
        badge="🔒 Legal"
        title="Privacy"
        highlight="Policy"
        description="Last updated: May 1, 2026 — Your trust is the foundation of our work."
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
