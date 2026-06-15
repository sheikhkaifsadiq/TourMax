import { useState } from "react";
import PageShell from "@/components/PageShell";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, X, CalendarClock, Mail, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

export default function MyBookings() {
  const { isAuthenticated } = useAuth();
  const [reference, setReference] = useState("");
  const [email, setEmail] = useState("");
  const [loaded, setLoaded] = useState<{ booking: any; tour: any } | null>(null);
  const [editing, setEditing] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newCount, setNewCount] = useState(1);
  const [reason, setReason] = useState("");

  const utils = trpc.useUtils();
  const cancel = trpc.bookings.cancel.useMutation({
    onSuccess: () => {
      toast.success("Booking cancelled");
      setCancelling(false);
      lookup();
    },
    onError: (e) => toast.error(e.message),
  });
  const modify = trpc.bookings.modify.useMutation({
    onSuccess: () => {
      toast.success("Booking updated");
      setEditing(false);
      lookup();
    },
    onError: (e) => toast.error(e.message),
  });
  const message = trpc.comms.sendToHost.useMutation({
    onSuccess: () => toast.success("Message sent to host"),
    onError: (e) => toast.error(e.message),
  });

  const [hostMsg, setHostMsg] = useState("");
  const [looking, setLooking] = useState(false);

  const myBookings = trpc.bookings.getMyBookings.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const selectBooking = (data: any) => {
    setLoaded(data);
    setNewDate(data.booking.selectedDate);
    setNewCount(data.booking.travelerCount);
    setEmail(data.booking.guestEmail);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const lookup = async () => {
    if (!reference.trim()) return toast.error("Enter your booking reference");
    setLooking(true);
    try {
      const data = await utils.client.bookings.getByReference.query({ reference: reference.trim() });
      if (email && data.booking.guestEmail.toLowerCase() !== email.trim().toLowerCase()) {
        toast.error("Email does not match this booking");
        setLoaded(null);
        return;
      }
      setLoaded(data);
      setNewDate(data.booking.selectedDate);
      setNewCount(data.booking.travelerCount);
    } catch (e: any) {
      toast.error(e?.message || "Booking not found");
      setLoaded(null);
    } finally {
      setLooking(false);
    }
  };

  const statusColor = (s: string) =>
    s === "confirmed" ? "bg-green-100 text-green-800"
      : s === "cancelled" ? "bg-red-100 text-red-800"
      : s === "modified" ? "bg-amber-100 text-amber-800"
      : "bg-slate-100 text-slate-800";

  return (
    <PageShell>
      <PageHeader
        badge="📋 Manage"
        title="My Bookings"
        description="Look up a booking with its reference and email — cancel, change date, or message the host."
      />

      <section className="py-12 bg-slate-50">
        <div className="container px-4 mx-auto max-w-3xl">
          <Card className="p-6">
            <div className="grid md:grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">Booking reference</label>
                <Input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="BK-…" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">Email used at booking</label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
              </div>
            </div>
            <Button onClick={lookup} disabled={looking} className="bg-blue-600 hover:bg-blue-700">
              {looking ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Looking up</> : <><Search className="w-4 h-4 mr-2" /> Find booking</>}
            </Button>
          </Card>

          {!loaded && myBookings.data && myBookings.data.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Your Bookings</h2>
              <div className="grid gap-4">
                {myBookings.data.map((item: any) => (
                  <Card key={item.booking.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between hover:shadow-md transition cursor-pointer" onClick={() => selectBooking(item)}>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-900">{item.booking.bookingReference}</span>
                        <Badge className={statusColor(item.booking.status)}>{item.booking.status}</Badge>
                      </div>
                      <p className="text-slate-600 font-medium">{item.tour?.title}</p>
                      <p className="text-sm text-slate-500 mt-1">{item.booking.selectedDate} • {item.booking.travelerCount} travelers</p>
                    </div>
                    <Button variant="outline" className="mt-4 md:mt-0" onClick={(e) => { e.stopPropagation(); selectBooking(item); }}>
                      Manage
                    </Button>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {loaded && (
            <Card className="p-6 mt-6">
              <div className="mb-4">
                <Button variant="ghost" size="sm" onClick={() => setLoaded(null)} className="mb-2 -ml-2 text-slate-500">
                  ← Back to list
                </Button>
              </div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm text-slate-500">Reference</p>
                  <p className="text-xl font-bold text-slate-900">{loaded.booking.bookingReference}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge className={statusColor(loaded.booking.status)}>{loaded.booking.status}</Badge>
                  <Badge variant="outline">Payment: {loaded.booking.paymentStatus}</Badge>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-3 text-sm mb-4">
                <div className="p-3 bg-slate-50 rounded"><strong className="block text-slate-600 text-xs">Tour</strong>{loaded.tour?.title}</div>
                <div className="p-3 bg-slate-50 rounded"><strong className="block text-slate-600 text-xs">Destination</strong>{loaded.tour?.destination}</div>
                <div className="p-3 bg-slate-50 rounded"><strong className="block text-slate-600 text-xs">Date</strong>{loaded.booking.selectedDate}</div>
                <div className="p-3 bg-slate-50 rounded"><strong className="block text-slate-600 text-xs">Travelers</strong>{loaded.booking.travelerCount}</div>
                <div className="p-3 bg-slate-50 rounded col-span-2"><strong className="block text-slate-600 text-xs">Total</strong>{loaded.booking.currency} {loaded.booking.totalPrice}</div>
              </div>

              {loaded.booking.status !== "cancelled" && (
                <div className="flex flex-wrap gap-2 mb-4">
                  <Button variant="outline" onClick={() => {
                    setEditing((v) => !v);
                    setCancelling(false);
                  }}>
                    <CalendarClock className="w-4 h-4 mr-2" /> Change date / travelers
                  </Button>
                  <Button
                    variant="outline"
                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={() => {
                      if (!email) return toast.error("Enter the email used at booking to cancel");
                      setCancelling((v) => !v);
                      setEditing(false);
                    }}
                  >
                    <X className="w-4 h-4 mr-2" /> Cancel booking
                  </Button>
                </div>
              )}

              {cancelling && (
                <Card className="p-4 bg-red-50 border-red-200 mb-4">
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-slate-900 mb-1">Reason for cancelling (optional)</label>
                    <textarea
                      className="w-full min-h-[60px] rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="e.g. Schedule changed, found a better alternative..."
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => cancel.mutate({ reference: loaded.booking.bookingReference, email, reason })}
                      disabled={cancel.isPending}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {cancel.isPending ? "Cancelling..." : "Confirm Cancellation"}
                    </Button>
                    <Button variant="ghost" onClick={() => setCancelling(false)}>
                      Keep Booking
                    </Button>
                  </div>
                </Card>
              )}

              {editing && (
                <Card className="p-4 bg-amber-50 border-amber-200 mb-4">
                  <div className="grid md:grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-900 mb-1">New date</label>
                      <Input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-900 mb-1">Travelers</label>
                      <Input type="number" min={1} value={newCount} onChange={(e) => setNewCount(parseInt(e.target.value) || 1)} />
                    </div>
                  </div>
                  <Button
                    onClick={() => modify.mutate({ reference: loaded.booking.bookingReference, email, newDate, newTravelerCount: newCount })}
                    disabled={modify.isPending}
                    className="bg-amber-600 hover:bg-amber-700"
                  >
                    Save changes
                  </Button>
                </Card>
              )}

              <div className="border-t border-slate-200 pt-4">
                <p className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4" /> Message the host
                </p>
                <textarea
                  className="w-full min-h-[80px] rounded-md border border-slate-200 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Question about pickup, dietary needs, accessibility..."
                  value={hostMsg}
                  onChange={(e) => setHostMsg(e.target.value)}
                  maxLength={2000}
                />
                <Button
                  className="mt-2 bg-blue-600 hover:bg-blue-700"
                  disabled={!hostMsg.trim() || message.isPending}
                  onClick={() => {
                    message.mutate({ bookingReference: loaded.booking.bookingReference, email, message: hostMsg });
                    setHostMsg("");
                  }}
                >
                  Send to host
                </Button>
              </div>
            </Card>
          )}
        </div>
      </section>
    </PageShell>
  );
}
