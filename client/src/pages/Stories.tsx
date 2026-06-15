import { useLocation } from "wouter";
import PageShell from "@/components/PageShell";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Stories() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const q = trpc.community.stories.list.useQuery({ limit: 60 });

  return (
    <PageShell>
      <PageHeader badge="📔 Stories" title="Trip" highlight="Stories" description="Real travelers, real journeys." />
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-end mb-6">
            {user && <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setLocation("/stories/new")}>Share your story</Button>}
          </div>
          {q.isLoading ? (
            <p className="text-slate-500">Loading…</p>
          ) : q.data?.length === 0 ? (
            <p className="text-slate-500 text-center py-12">No stories yet. Be the first to share.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {q.data?.map((st: any) => (
                <Card key={st.id} className="overflow-hidden cursor-pointer hover:shadow-lg transition" onClick={() => setLocation(`/stories/${st.id}`)}>
                  {st.coverImageUrl ? (
                    <img src={st.coverImageUrl} alt={st.title} className="w-full h-52 object-cover" />
                  ) : (
                    <div className="w-full h-52 bg-gradient-to-br from-blue-100 to-indigo-100" />
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-slate-900 line-clamp-2">{st.title}</h3>
                    {st.destination && <p className="text-sm text-slate-500 mt-1">📍 {st.destination}</p>}
                    <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
                      <span>by @{st.author?.username || "anon"}</span>
                      <span>❤️ {st.likeCount || 0} · 💬 {st.commentCount || 0}</span>
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
