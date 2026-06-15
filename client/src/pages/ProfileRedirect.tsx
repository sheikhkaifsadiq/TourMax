import { useEffect } from "react";
import { useLocation } from "wouter";
import PageShell from "@/components/PageShell";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

export default function ProfileRedirect() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  
  const { data, isLoading } = trpc.community.profiles.me.useQuery(undefined, { enabled: !!user });
  
  useEffect(() => {
    if (isLoading || !user) return;
    if (data?.username) {
      setLocation(`/u/${data.username}`, { replace: true });
    } else {
      setLocation("/profile/edit", { replace: true });
    }
  }, [data, isLoading, user, setLocation]);
  
  return (
    <PageShell>
      <div className="flex items-center justify-center min-h-[50vh] text-slate-500">
        <span className="animate-pulse">Loading profile...</span>
      </div>
    </PageShell>
  );
}
