import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import PageShell from "@/components/PageShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function PaymentResult({ outcome }: { outcome: "success" | "cancel" }) {
  const [, setLocation] = useLocation();
  const [reference, setReference] = useState("");
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setReference(params.get("ref") || "");
  }, []);

  const booking = trpc.bookings.getByReference.useQuery(
    { reference },
    { enabled: !!reference, refetchInterval: outcome === "success" ? 2000 : false },
  );

  const paid = booking.data?.booking?.paymentStatus === "paid";

  return (
    <PageShell>
      <section className="py-24">
        <div className="container max-w-md mx-auto px-4 text-center">
          <Card className="p-8">
            {outcome === "success" ? (
              paid ? (
                <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              ) : (
                <Loader2 className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-spin" />
              )
            ) : (
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            )}
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              {outcome === "success"
                ? paid
                  ? "Payment received!"
                  : "Confirming your payment…"
                : "Payment cancelled"}
            </h1>
            <p className="text-slate-600 mb-4">
              {outcome === "success"
                ? paid
                  ? `Your booking ${reference} is confirmed. A receipt was emailed to you.`
                  : `We're verifying your payment for booking ${reference}. This page will update automatically.`
                : "No charge was made. Your booking is still pending — you can retry payment from My Bookings."}
            </p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={() => setLocation("/my-bookings")}>My bookings</Button>
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setLocation("/tours")}>Explore more tours</Button>
            </div>
          </Card>
        </div>
      </section>
    </PageShell>
  );
}
