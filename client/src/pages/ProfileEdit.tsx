import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import PageShell from "@/components/PageShell";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

export default function ProfileEdit() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const me = trpc.community.profiles.me.useQuery(undefined, { enabled: !!user });
  const upsert = trpc.community.profiles.upsert.useMutation({
    onSuccess: (p) => {
      toast.success("Profile saved");
      if (p) setLocation(`/u/${p.username}`);
    },
    onError: (e) => toast.error(e.message),
  });

  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLoc] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [countries, setCountries] = useState<number>(0);

  useEffect(() => {
    if (me.data) {
      setUsername(me.data.username);
      setDisplayName(me.data.displayName || "");
      setBio(me.data.bio || "");
      setLoc(me.data.location || "");
      setAvatarUrl(me.data.avatarUrl || "");
      setCountries(me.data.countriesVisited || 0);
    } else if (user && !me.isLoading) {
      const suggest = (user.name || user.email || `user${user.id}`).toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 28);
      setUsername(suggest);
      setDisplayName(user.name || "");
    }
  }, [me.data, me.isLoading, user]);

  if (loading) return <PageShell><div className="p-16 text-center text-slate-500">Loading…</div></PageShell>;
  if (!user) return <PageShell><div className="p-16 text-center">Please sign in.</div></PageShell>;

  return (
    <PageShell>
      <PageHeader badge="✍️ Profile" title="Edit your" highlight="Profile" description="Tell other travelers who you are." />
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card className="p-6 space-y-4">
            <div>
              <label className="text-sm font-medium">Username</label>
              <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="e.g. kaif" />
              <p className="text-xs text-slate-500 mt-1">3–32 chars · letters, numbers, underscore</p>
            </div>
            <div>
              <label className="text-sm font-medium">Display name</label>
              <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">Avatar URL</label>
              <Input value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://…" />
            </div>
            <div>
              <label className="text-sm font-medium">Bio</label>
              <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">Location</label>
                <Input value={location} onChange={(e) => setLoc(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium">Countries visited</label>
                <Input type="number" min="0" value={countries} onChange={(e) => setCountries(Number(e.target.value))} />
              </div>
            </div>
            <Button
              className="bg-blue-600 hover:bg-blue-700 w-full"
              disabled={upsert.isPending || !username}
              onClick={() => upsert.mutate({ username, displayName, bio, location, avatarUrl, countriesVisited: countries })}
            >
              {upsert.isPending ? "Saving…" : "Save Profile"}
            </Button>
          </Card>
        </div>
      </section>
    </PageShell>
  );
}
