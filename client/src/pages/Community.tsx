import { useState } from "react";
import { useLocation } from "wouter";
import PageShell from "@/components/PageShell";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { Plus, MessageSquare, Eye } from "lucide-react";

export default function Community() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [catId, setCatId] = useState<number | undefined>(undefined);
  const cats = trpc.community.forums.categories.useQuery();
  const threads = trpc.community.forums.threads.useQuery({ categoryId: catId, limit: 50 });
  const utils = trpc.useUtils();

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [destination, setDestination] = useState("");
  const [newCatId, setNewCatId] = useState<number | undefined>(undefined);

  const create = trpc.community.forums.createThread.useMutation({
    onSuccess: (t) => {
      toast.success("Thread posted");
      setOpen(false); setTitle(""); setBody(""); setDestination("");
      utils.community.forums.threads.invalidate();
      setLocation(`/community/thread/${t.id}`);
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <PageShell>
      <PageHeader badge="💬 Community" title="Traveler" highlight="Community" description="Share tips, ask questions, find your next travel buddy." />

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="flex flex-wrap gap-2">
              <Button variant={catId === undefined ? "default" : "outline"} size="sm" onClick={() => setCatId(undefined)}>All</Button>
              {cats.data?.map((c) => (
                <Button key={c.id} variant={catId === c.id ? "default" : "outline"} size="sm" onClick={() => setCatId(c.id)}>
                  {c.icon} {c.name}
                </Button>
              ))}
            </div>
            {user && (
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700"><Plus className="w-4 h-4 mr-1" />New Thread</Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader><DialogTitle>Start a discussion</DialogTitle></DialogHeader>
                  <div className="space-y-3">
                    <Select value={newCatId?.toString()} onValueChange={(v) => setNewCatId(Number(v))}>
                      <SelectTrigger><SelectValue placeholder="Choose a category" /></SelectTrigger>
                      <SelectContent>
                        {cats.data?.map((c) => <SelectItem key={c.id} value={c.id.toString()}>{c.icon} {c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Input placeholder="Title (5–255 chars)" value={title} onChange={(e) => setTitle(e.target.value)} />
                    <Input placeholder="Destination (optional)" value={destination} onChange={(e) => setDestination(e.target.value)} />
                    <Textarea placeholder="Write your post…" rows={8} value={body} onChange={(e) => setBody(e.target.value)} />
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      disabled={!newCatId || title.length < 5 || body.length < 10 || create.isPending}
                      onClick={() => newCatId && create.mutate({ categoryId: newCatId, title, body, destination: destination || undefined })}
                    >Post</Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {threads.isLoading ? (
            <p className="text-slate-500">Loading…</p>
          ) : threads.data?.length === 0 ? (
            <p className="text-slate-500">No threads yet. Be the first!</p>
          ) : (
            <div className="space-y-3">
              {threads.data?.map((t: any) => (
                <Card key={t.id} className="p-4 cursor-pointer hover:shadow transition" onClick={() => setLocation(`/community/thread/${t.id}`)}>
                  <div className="flex justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 truncate">{t.isPinned && "📌 "}{t.title}</h3>
                      <p className="text-sm text-slate-600 line-clamp-2 mt-1">{t.body}</p>
                      <div className="text-xs text-slate-500 mt-2 flex gap-3">
                        <span>by @{t.author?.username || "anon"}</span>
                        {t.destination && <span>📍 {t.destination}</span>}
                        <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{t.replyCount}</span>
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{t.views}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </PageShell>
  );
}
