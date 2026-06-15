import { useState } from "react";
import { useLocation } from "wouter";
import PageShell from "@/components/PageShell";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

export default function StoryNew() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [cover, setCover] = useState("");
  const [destination, setDestination] = useState("");
  const [rating, setRating] = useState<number | undefined>();

  const create = trpc.community.stories.create.useMutation({
    onSuccess: (st) => { toast.success("Story published"); setLocation(`/stories/${st.id}`); },
    onError: (e) => toast.error(e.message),
  });

  if (loading) return <PageShell><div className="p-16 text-center text-slate-500">Loading…</div></PageShell>;
  if (!user) return <PageShell><div className="p-16 text-center">Sign in to share a story.</div></PageShell>;

  return (
    <PageShell>
      <PageHeader badge="📔 Story" title="Share your" highlight="Trip Story" description="Inspire other travelers." />
      <section className="py-10">
        <div className="container max-w-2xl mx-auto px-4">
          <Card className="p-6 space-y-4">
            <Input placeholder="Story title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Input placeholder="Cover image URL (optional)" value={cover} onChange={(e) => setCover(e.target.value)} />
            <Input placeholder="Destination" value={destination} onChange={(e) => setDestination(e.target.value)} />
            <div>
              <label className="text-sm text-slate-600">Rating</label>
              <div className="flex gap-1 mt-1">
                {[1,2,3,4,5].map((n) => (
                  <button key={n} onClick={() => setRating(n)} className={`text-2xl ${rating && n <= rating ? "" : "opacity-30"}`}>⭐</button>
                ))}
              </div>
            </div>
            <Textarea rows={12} placeholder="Tell your story…" value={body} onChange={(e) => setBody(e.target.value)} />
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={title.length < 5 || body.length < 20 || create.isPending}
              onClick={() => create.mutate({ title, body, coverImageUrl: cover, destination, rating })}
            >
              {create.isPending ? "Publishing…" : "Publish Story"}
            </Button>
          </Card>
        </div>
      </section>
    </PageShell>
  );
}
