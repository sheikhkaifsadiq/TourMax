import { useLocation } from "wouter";
import PageShell from "@/components/PageShell";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Feed() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const q = trpc.community.social.feed.useQuery(undefined, { enabled: !!user });

  if (loading) return <PageShell><div className="p-16 text-center text-slate-500">Loading…</div></PageShell>;
  if (!user) return <PageShell><div className="p-16 text-center">Sign in to see your feed.</div></PageShell>;

  return (
    <PageShell>
      <PageHeader badge="📡 Feed" title="Your" highlight="Feed" description="Stories and activity from travelers you follow." />
      <section className="py-10">
        <div className="container max-w-3xl mx-auto px-4 space-y-8">
          <div>
            <h2 className="text-lg font-semibold mb-3">Stories</h2>
            {q.data?.stories.length === 0 ? (
              <p className="text-slate-500">Follow other travelers to see their stories here.</p>
            ) : (
              <div className="space-y-4">
                {q.data?.stories.map((st: any) => (
                  <Card key={st.id} className="p-4 cursor-pointer hover:shadow" onClick={() => setLocation(`/stories/${st.id}`)}>
                    <div className="text-xs text-slate-500">@{st.author?.username || "anon"}</div>
                    <h3 className="font-semibold mt-1">{st.title}</h3>
                    {st.destination && <p className="text-sm text-slate-500">📍 {st.destination}</p>}
                  </Card>
                ))}
              </div>
            )}
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-3">Recent activity</h2>
            {q.data?.events.length === 0 ? (
              <p className="text-slate-500">No activity yet.</p>
            ) : (
              <ul className="space-y-2 text-sm text-slate-600">
                {q.data?.events.map((e: any) => (
                  <li key={e.id} className="border-b border-slate-100 pb-2">
                    <span className="font-medium">@{e.actor?.username || "anon"}</span> {e.verb} a {e.objectType}
                    {e.metadata?.title && <> — “{e.metadata.title}”</>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
