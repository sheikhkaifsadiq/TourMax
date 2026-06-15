import { useState } from "react";
import PageShell from "@/components/PageShell";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { toast } from "sonner";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill in the required fields.");
      return;
    }
    setSending(true);
    setTimeout(() => {
      toast.success("Message sent! We'll be in touch within 24 hours.");
      setForm({ name: "", email: "", subject: "", message: "" });
      setSending(false);
    }, 700);
  };

  return (
    <PageShell>
      <PageHeader
        badge="💬 Get In Touch"
        title="We'd Love To"
        highlight="Hear From You"
        description="Questions about a tour, custom itineraries, or partnerships — our team responds within a day."
      />

      <section className="py-20 bg-white">
        <div className="container px-4 mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-6 lg:col-span-1">
              {[
                { icon: Mail, label: "Email", value: "info@tourmax.com" },
                { icon: Phone, label: "Phone", value: "+1-800-TOURS" },
                { icon: MapPin, label: "Office", value: "123 Travel Street, Adventure City, AC 12345" },
              ].map((c) => (
                <Card key={c.label} className="p-6 border-slate-200">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shrink-0">
                      <c.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide">{c.label}</div>
                      <div className="text-slate-900 font-medium mt-1">{c.value}</div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <Card className="p-8 lg:col-span-2 border-slate-200 shadow-sm">
              <h3 className="text-2xl font-bold text-slate-900 mb-6">Send us a message</h3>
              <form onSubmit={submit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  <Input type="email" placeholder="Email address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <Input placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
                <textarea
                  className="w-full min-h-[160px] rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="How can we help?"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                />
                <Button type="submit" disabled={sending} className="bg-blue-600 hover:bg-blue-700 w-full md:w-auto">
                  <Send className="w-4 h-4 mr-2" />
                  {sending ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
