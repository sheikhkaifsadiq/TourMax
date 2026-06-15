import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import PageShell from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { MapPin, Users, Globe, Pencil } from "lucide-react";

export default function Profile() {
  const [, params] = useRoute("/u/:username");
  const username = params?.username || "";
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const utils = trpc.useUtils();

  const q = trpc.community.profiles.getByUsername.useQuery({ username }, { enabled: !!username });
  const followToggle = trpc.community.follows.toggle.useMutation({
    onSuccess: (r) => {
      toast.success(r.following ? "Following" : "Unfollowed");
      utils.community.profiles.getByUsername.invalidate({ username });
    },
  });

  if (!username) return <PageShell><div className="p-16 text-center">No user</div></PageShell>;
  if (q.isLoading) return <PageShell><div className="p-16 text-center text-slate-500">Loading…</div></PageShell>;
  if (!q.data) return <PageShell><div className="p-16 text-center">Profile not found</div></PageShell>;

  const { profile, followers, following, stories } = q.data;
  const isOwn = user?.id === profile.userId;

  return (
    <PageShell>
      <section className="bg-gradient-to-br from-blue-50 to-white border-b border-slate-100">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-4xl font-bold overflow-hidden">
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt={profile.username} className="w-full h-full object-cover" />
              ) : (
                (profile.displayName || profile.username).charAt(0).toUpperCase()
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-3xl font-bold text-slate-900">{profile.displayName || profile.username}</h1>
                {profile.isHost && <Badge className="bg-emerald-100 text-emerald-700">Host</Badge>}
              </div>
              <p className="text-slate-500">@{profile.username}</p>
              {profile.bio && <p className="text-slate-700 mt-3 max-w-2xl">{profile.bio}</p>}
              <div className="flex flex-wrap gap-4 mt-4 text-sm text-slate-600">
                {profile.location && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{profile.location}</span>}
                {!!profile.countriesVisited && <span className="flex items-center gap-1"><Globe className="w-4 h-4" />{profile.countriesVisited} countries</span>}
                <span className="flex items-center gap-1"><Users className="w-4 h-4" />{followers} followers · {following} following</span>
              </div>
              <div className="flex gap-2 mt-5">
                {isOwn ? (
                  <Button onClick={() => setLocation("/profile/edit")} variant="outline"><Pencil className="w-4 h-4 mr-2" />Edit profile</Button>
                ) : user ? (
                  <Button onClick={() => followToggle.mutate({ followeeUserId: profile.userId })} className="bg-blue-600 hover:bg-blue-700">
                    Follow
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6">Trip Stories</h2>
        {stories.length === 0 ? (
          <p className="text-slate-500">No stories yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.map((st: any) => (
              <Card key={st.id} className="overflow-hidden cursor-pointer hover:shadow-lg transition" onClick={() => setLocation(`/stories/${st.id}`)}>
                {st.coverImageUrl && <img src={st.coverImageUrl} alt={st.title} className="w-full h-48 object-cover" />}
                <div className="p-4">
                  <h3 className="font-semibold text-slate-900">{st.title}</h3>
                  {st.destination && <p className="text-sm text-slate-500 mt-1">📍 {st.destination}</p>}
                  <p className="text-xs text-slate-400 mt-2">❤️ {st.likeCount || 0} · 💬 {st.commentCount || 0}</p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </PageShell>
  );
}
