import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import PageShell from "@/components/PageShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { Flag } from "lucide-react";

export default function Thread() {
  const [, params] = useRoute("/community/thread/:id");
  const [, setLocation] = useLocation();
  const id = Number(params?.id);
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const [body, setBody] = useState("");

  const q = trpc.community.forums.thread.useQuery({ id }, { enabled: !!id });
  const reply = trpc.community.forums.reply.useMutation({
    onSuccess: () => {
      toast.success("Replied");
      setBody("");
      utils.community.forums.thread.invalidate({ id });
    },
    onError: (e) => toast.error(e.message),
  });
  const report = trpc.community.social.report.useMutation({
    onSuccess: () => toast.success("Report submitted. An admin will review."),
    onError: (e) => toast.error(e.message),
  });

  if (q.isLoading) return <PageShell><div className="p-16 text-center text-slate-500">Loading…</div></PageShell>;
  if (!q.data) return <PageShell><div className="p-16 text-center">Thread not found</div></PageShell>;
  const { thread, replies } = q.data;

  const flag = (targetType: "thread" | "reply", targetId: number) => {
    const reason = window.prompt("Why are you reporting this?");
    if (!reason) return;
    report.mutate({ targetType, targetId, reason: reason.slice(0, 80) });
  };

  return (
    <PageShell>
      <section className="container mx-auto px-4 py-10 max-w-3xl">
        <Button variant="ghost" size="sm" onClick={() => setLocation("/community")}>← Back to community</Button>
        <Card className="p-6 mt-4">
          <h1 className="text-2xl font-bold text-slate-900">{thread.title}</h1>
          <div className="text-sm text-slate-500 mt-1 flex justify-between items-center">
            <span>
              by <button className="text-blue-600 hover:underline" onClick={() => thread.author && setLocation(`/u/${thread.author.username}`)}>@{thread.author?.username || "anon"}</button>
              {thread.destination && <> · 📍 {thread.destination}</>}
              <> · 👁️ {thread.views}</>
            </span>
            {user && user.id !== thread.authorId && (
              <Button size="sm" variant="ghost" onClick={() => flag("thread", thread.id)}><Flag className="w-3 h-3 mr-1" />Report</Button>
            )}
          </div>
          <p className="mt-4 text-slate-700 whitespace-pre-wrap">{thread.body}</p>
        </Card>

        <h2 className="text-lg font-semibold mt-8 mb-3">{replies.length} Replies</h2>
        <div className="space-y-3">
          {replies.map((r: any) => (
            <Card key={r.id} className="p-4">
              <div className="text-sm text-slate-500 flex justify-between items-center">
                <button className="text-blue-600 hover:underline" onClick={() => r.author && setLocation(`/u/${r.author.username}`)}>
                  @{r.author?.username || "anon"} · {r.author?.displayName}
                </button>
                {user && user.id !== r.authorId && (
                  <button onClick={() => flag("reply", r.id)} className="text-slate-400 hover:text-red-600"><Flag className="w-3 h-3" /></button>
                )}
              </div>
              <p className="mt-2 text-slate-700 whitespace-pre-wrap">{r.body}</p>
            </Card>
          ))}
        </div>

        {user ? (
          <Card className="p-4 mt-6">
            <Textarea rows={4} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write a reply…" />
            <Button
              className="mt-3 bg-blue-600 hover:bg-blue-700"
              disabled={body.length < 1 || reply.isPending}
              onClick={() => reply.mutate({ threadId: id, body })}
            >Reply</Button>
          </Card>
        ) : (
          <p className="mt-6 text-center text-slate-500">Sign in to reply.</p>
        )}
      </section>
    </PageShell>
  );
}
