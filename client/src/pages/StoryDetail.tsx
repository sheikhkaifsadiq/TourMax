import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import PageShell from "@/components/PageShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { Heart, Flag } from "lucide-react";

export default function StoryDetail() {
  const [, params] = useRoute("/stories/:id");
  const [, setLocation] = useLocation();
  const id = Number(params?.id);
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const [comment, setComment] = useState("");

  const q = trpc.community.stories.get.useQuery({ id }, { enabled: !!id });
  const liked = trpc.community.social.hasLiked.useQuery({ targetType: "story", targetId: id }, { enabled: !!id && !!user });
  const like = trpc.community.social.like.useMutation({
    onSuccess: () => { utils.community.stories.get.invalidate({ id }); utils.community.social.hasLiked.invalidate(); },
  });
  const unlike = trpc.community.social.unlike.useMutation({
    onSuccess: () => { utils.community.stories.get.invalidate({ id }); utils.community.social.hasLiked.invalidate(); },
  });
  const addComment = trpc.community.social.comment.useMutation({
    onSuccess: () => { toast.success("Comment added"); setComment(""); utils.community.stories.get.invalidate({ id }); },
  });
  const report = trpc.community.social.report.useMutation({
    onSuccess: () => toast.success("Report submitted"),
  });

  if (q.isLoading) return <PageShell><div className="p-16 text-center text-slate-500">Loading…</div></PageShell>;
  if (!q.data) return <PageShell><div className="p-16 text-center">Story not found</div></PageShell>;
  const { story, comments } = q.data;

  return (
    <PageShell>
      <article className="container max-w-3xl mx-auto px-4 py-10">
        <Button variant="ghost" size="sm" onClick={() => setLocation("/stories")}>← Back to stories</Button>
        {story.coverImageUrl && <img src={story.coverImageUrl} alt={story.title} className="w-full h-80 object-cover rounded-xl mt-4" />}
        <h1 className="text-3xl font-bold mt-6">{story.title}</h1>
        <div className="text-sm text-slate-500 mt-2 flex justify-between items-center">
          <span>
            by <button className="text-blue-600 hover:underline" onClick={() => story.author && setLocation(`/u/${story.author.username}`)}>@{story.author?.username || "anon"}</button>
            {story.destination && <> · 📍 {story.destination}</>}
            {story.rating && <> · {"⭐".repeat(story.rating)}</>}
          </span>
          {user && user.id !== story.authorId && (
            <button onClick={() => { const r = prompt("Reason?"); if (r) report.mutate({ targetType: "story", targetId: id, reason: r.slice(0,80) }); }} className="text-slate-400 hover:text-red-600"><Flag className="w-4 h-4" /></button>
          )}
        </div>
        <div className="mt-6 text-slate-700 whitespace-pre-wrap leading-relaxed">{story.body}</div>

        <div className="mt-6 flex items-center gap-4">
          {user ? (
            <Button
              variant={liked.data ? "default" : "outline"}
              onClick={() => liked.data ? unlike.mutate({ targetType: "story", targetId: id }) : like.mutate({ targetType: "story", targetId: id })}
              className={liked.data ? "bg-rose-600 hover:bg-rose-700" : ""}
            >
              <Heart className={`w-4 h-4 mr-2 ${liked.data ? "fill-current" : ""}`} />
              {story.likeCount || 0}
            </Button>
          ) : (
            <span className="text-slate-500">❤️ {story.likeCount || 0}</span>
          )}
          <span className="text-slate-500">💬 {comments.length} comments</span>
        </div>

        <section className="mt-10">
          <h2 className="text-xl font-semibold mb-4">Comments</h2>
          {user && (
            <Card className="p-4 mb-4">
              <Textarea rows={3} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Share your thoughts…" />
              <Button
                className="mt-2 bg-blue-600 hover:bg-blue-700"
                disabled={!comment || addComment.isPending}
                onClick={() => addComment.mutate({ targetType: "story", targetId: id, body: comment })}
              >Post comment</Button>
            </Card>
          )}
          <div className="space-y-3">
            {comments.map((c: any) => (
              <Card key={c.id} className="p-4">
                <div className="text-sm text-slate-500">@{c.author?.username || "anon"}</div>
                <p className="mt-1 text-slate-700">{c.body}</p>
              </Card>
            ))}
          </div>
        </section>
      </article>
    </PageShell>
  );
}
