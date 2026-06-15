import { useState } from "react";
import PageShell from "@/components/PageShell";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Loader2, TrendingUp, DollarSign, Package, Calendar, Trash2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

export default function Host() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <PageShell>
        <div className="py-32 text-center text-slate-500">Loading…</div>
      </PageShell>
    );
  }
  if (!isAuthenticated) {
    return (
      <PageShell>
        <PageHeader badge="🏡 Host" title="Host Dashboard" description="Sign in to manage your tour listings." />
        <section className="py-16">
          <div className="container max-w-md mx-auto text-center">
            <p className="text-slate-600 mb-4">Please sign in to access your host dashboard.</p>
            <Button onClick={() => (window.location.href = "/login")} className="bg-blue-600 hover:bg-blue-700">
              Sign in
            </Button>
          </div>
        </section>
      </PageShell>
    );
  }
  return <HostDashboard />;
}

function HostDashboard() {
  const utils = trpc.useUtils();
  const listings = trpc.host.myListings.useQuery();
  const analytics = trpc.host.analytics.useQuery();
  const bookings = trpc.host.listingBookings.useQuery();

  const del = trpc.host.deleteListing.useMutation({
    onSuccess: () => {
      toast.success("Listing deleted");
      utils.host.myListings.invalidate();
      utils.host.analytics.invalidate();
      utils.host.listingBookings.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <PageShell>
      <PageHeader
        badge="🏡 Host Dashboard"
        title="Manage Your"
        highlight="Listings"
        description="Create new tours, track bookings, and see your earnings at a glance."
      />

      <section className="py-12 bg-slate-50 border-b border-slate-200">
        <div className="container px-4 mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Stat icon={<Package />} label="Active listings" value={analytics.data?.listings ?? "—"} />
            <Stat icon={<Calendar />} label="Total bookings" value={analytics.data?.bookings ?? "—"} />
            <Stat icon={<DollarSign />} label="Revenue" value={analytics.data ? `${analytics.data.currency} ${analytics.data.revenue.toLocaleString()}` : "—"} />
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container px-4 mx-auto max-w-6xl">
          <Tabs defaultValue="listings">
            <TabsList>
              <TabsTrigger value="listings">My listings</TabsTrigger>
              <TabsTrigger value="create">Create new</TabsTrigger>
              <TabsTrigger value="bookings">Bookings</TabsTrigger>
            </TabsList>

            <TabsContent value="listings" className="mt-6">
              {listings.isLoading ? (
                <div className="py-12 text-center text-slate-500"><Loader2 className="w-5 h-5 inline animate-spin" /> Loading…</div>
              ) : !listings.data || listings.data.length === 0 ? (
                <div className="py-12 text-center text-slate-500">No listings yet. Use the "Create new" tab to add your first tour.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {listings.data.map((t: any) => (
                    <Card key={t.id} className="overflow-hidden">
                      <img src={t.imageUrl} alt={t.title} className="w-full h-40 object-cover" />
                      <div className="p-4">
                        <p className="font-semibold text-slate-900 line-clamp-1">{t.title}</p>
                        <p className="text-sm text-slate-500">{t.destination}</p>
                        <div className="flex items-center justify-between mt-2">
                          <Badge variant="outline">{t.activityType}</Badge>
                          <span className="font-semibold text-blue-600">{t.currency} {parseFloat(t.price).toFixed(0)}</span>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="mt-3 text-red-600 hover:bg-red-50"
                          onClick={() => {
                            if (confirm(`Delete "${t.title}"?`)) del.mutate({ id: t.id });
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-1" /> Delete
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="create" className="mt-6">
              <CreateListingForm
                onCreated={() => {
                  utils.host.myListings.invalidate();
                  utils.host.analytics.invalidate();
                }}
              />
            </TabsContent>

            <TabsContent value="bookings" className="mt-6">
              {bookings.isLoading ? (
                <div className="py-12 text-center text-slate-500"><Loader2 className="w-5 h-5 inline animate-spin" /> Loading…</div>
              ) : !bookings.data || bookings.data.bookings.length === 0 ? (
                <div className="py-12 text-center text-slate-500">No bookings yet for your listings.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-100 text-left">
                      <tr>
                        <th className="p-3">Ref</th>
                        <th className="p-3">Tour</th>
                        <th className="p-3">Guest</th>
                        <th className="p-3">Date</th>
                        <th className="p-3">Travelers</th>
                        <th className="p-3">Total</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.data.bookings.map((b: any) => {
                        const tour = bookings.data.tours.find((t: any) => t.id === b.tourId);
                        return (
                          <tr key={b.id} className="border-b border-slate-200">
                            <td className="p-3 font-mono text-xs">{b.bookingReference}</td>
                            <td className="p-3">{tour?.title || "—"}</td>
                            <td className="p-3">{b.guestFirstName} {b.guestLastName}<br /><span className="text-xs text-slate-500">{b.guestEmail}</span></td>
                            <td className="p-3">{b.selectedDate}</td>
                            <td className="p-3">{b.travelerCount}</td>
                            <td className="p-3 font-semibold">{b.currency} {b.totalPrice}</td>
                            <td className="p-3"><Badge variant="outline">{b.status}</Badge></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </PageShell>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: any }) {
  return (
    <Card className="p-5 flex items-center gap-4">
      <div className="w-12 h-12 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">{icon}</div>
      <div>
        <p className="text-xs text-slate-500 uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
      </div>
    </Card>
  );
}

function CreateListingForm({ onCreated }: { onCreated: () => void }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    destination: "",
    duration: "5",
    price: 199,
    imageUrl: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&h=800&fit=crop",
    activityType: "adventure",
    maxTravelers: 12,
    minTravelers: 1,
    highlights: "",
    inclusions: "",
    exclusions: "",
    availableDates: "",
    operatorName: "",
    operatorPhone: "",
  });

  const create = trpc.host.createListing.useMutation({
    onSuccess: () => {
      toast.success("Listing created!");
      onCreated();
      setForm({ ...form, title: "", description: "" });
    },
    onError: (e) => toast.error(e.message),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    create.mutate({
      title: form.title,
      description: form.description,
      destination: form.destination,
      duration: form.duration,
      price: Number(form.price),
      currency: "USD",
      imageUrl: form.imageUrl,
      activityType: form.activityType,
      maxTravelers: Number(form.maxTravelers),
      minTravelers: Number(form.minTravelers),
      highlights: form.highlights.split("\n").map((s) => s.trim()).filter(Boolean),
      inclusions: form.inclusions.split("\n").map((s) => s.trim()).filter(Boolean),
      exclusions: form.exclusions.split("\n").map((s) => s.trim()).filter(Boolean),
      availableDates: form.availableDates.split(",").map((s) => s.trim()).filter(Boolean),
      operatorName: form.operatorName || undefined,
      operatorPhone: form.operatorPhone || undefined,
    });
  };

  return (
    <Card className="p-6">
      <form onSubmit={submit} className="space-y-4">
        <Field label="Title">
          <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        </Field>
        <Field label="Description">
          <textarea className="w-full min-h-[100px] rounded-md border border-slate-200 p-2 text-sm" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
        </Field>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Field label="Destination"><Input value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} required /></Field>
          <Field label="Duration (days)"><Input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} /></Field>
          <Field label="Price (USD)"><Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} /></Field>
          <Field label="Activity type"><Input value={form.activityType} onChange={(e) => setForm({ ...form, activityType: e.target.value })} /></Field>
          <Field label="Max travelers"><Input type="number" value={form.maxTravelers} onChange={(e) => setForm({ ...form, maxTravelers: Number(e.target.value) })} /></Field>
          <Field label="Min travelers"><Input type="number" value={form.minTravelers} onChange={(e) => setForm({ ...form, minTravelers: Number(e.target.value) })} /></Field>
          <Field label="Operator name"><Input value={form.operatorName} onChange={(e) => setForm({ ...form, operatorName: e.target.value })} /></Field>
          <Field label="Operator phone"><Input value={form.operatorPhone} onChange={(e) => setForm({ ...form, operatorPhone: e.target.value })} /></Field>
        </div>
        <Field label="Cover image URL"><Input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} /></Field>
        <Field label="Highlights (one per line)">
          <textarea className="w-full min-h-[80px] rounded-md border border-slate-200 p-2 text-sm" value={form.highlights} onChange={(e) => setForm({ ...form, highlights: e.target.value })} />
        </Field>
        <div className="grid md:grid-cols-2 gap-3">
          <Field label="Inclusions (one per line)">
            <textarea className="w-full min-h-[80px] rounded-md border border-slate-200 p-2 text-sm" value={form.inclusions} onChange={(e) => setForm({ ...form, inclusions: e.target.value })} />
          </Field>
          <Field label="Exclusions (one per line)">
            <textarea className="w-full min-h-[80px] rounded-md border border-slate-200 p-2 text-sm" value={form.exclusions} onChange={(e) => setForm({ ...form, exclusions: e.target.value })} />
          </Field>
        </div>
        <Field label="Available dates (comma-separated YYYY-MM-DD)">
          <Input value={form.availableDates} onChange={(e) => setForm({ ...form, availableDates: e.target.value })} placeholder="2026-07-10, 2026-07-24" />
        </Field>
        <Button type="submit" disabled={create.isPending} className="bg-blue-600 hover:bg-blue-700">
          {create.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating</> : <><Plus className="w-4 h-4 mr-2" /> Create listing</>}
        </Button>
      </form>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-900 mb-1">{label}</label>
      {children}
    </div>
  );
}
