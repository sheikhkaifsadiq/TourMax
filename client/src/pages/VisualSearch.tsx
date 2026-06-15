import { useRef, useState } from "react";
import { useLocation } from "wouter";
import PageShell from "@/components/PageShell";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import TourGrid from "@/components/TourGrid";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Upload, Loader2, Sparkles } from "lucide-react";

export default function VisualSearch() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [sessionId] = useState(() => `visual-${Date.now()}`);
  const search = trpc.community.visualSearch.fromImage.useMutation({
    onError: (e) => toast.error(e.message),
  });

  const onFile = (f: File | null) => {
    if (!f) return;
    if (f.size > 8 * 1024 * 1024) { toast.error("Image too large (8MB max)"); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setPreview(dataUrl);
      search.mutate({ imageUrl: dataUrl });
    };
    reader.readAsDataURL(f);
  };

  return (
    <PageShell>
      <PageHeader badge="📸 Visual Search" title="Search by" highlight="Photo" description="Upload an inspiration photo — we'll find matching tours." />
      <section className="py-10">
        <div className="container mx-auto px-4 max-w-3xl">
          <Card className="p-8 text-center border-2 border-dashed">
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
            {preview ? (
              <img src={preview} alt="preview" className="max-h-64 mx-auto rounded-lg" />
            ) : (
              <div className="py-12 text-slate-400">
                <Upload className="w-12 h-12 mx-auto mb-3" />
                <p>Upload any travel photo (sunset, mountain, beach, city…)</p>
              </div>
            )}
            <Button className="mt-4 bg-blue-600 hover:bg-blue-700" onClick={() => fileRef.current?.click()}>
              {preview ? "Try another photo" : "Choose photo"}
            </Button>
          </Card>

          {search.isPending && (
            <div className="text-center mt-8 text-slate-600"><Loader2 className="w-6 h-6 animate-spin inline mr-2" /> Analyzing image…</div>
          )}

          {search.data && (
            <Card className="p-6 mt-6 bg-gradient-to-br from-blue-50 to-indigo-50">
              <h3 className="font-semibold flex items-center gap-2"><Sparkles className="w-4 h-4" />AI Analysis</h3>
              <p className="text-slate-700 mt-2">{search.data.analysis.summary}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {search.data.analysis.destination && <Badge>📍 {search.data.analysis.destination}</Badge>}
                {search.data.analysis.activityType && <Badge>🎯 {search.data.analysis.activityType}</Badge>}
                {search.data.analysis.keywords?.map((k: string) => <Badge key={k} variant="secondary">{k}</Badge>)}
              </div>
            </Card>
          )}
        </div>

        {search.data?.results && search.data.results.length > 0 && (
          <div className="container mx-auto px-4 mt-10">
            <h2 className="text-2xl font-bold mb-6">Matching Tours</h2>
            <TourGrid tours={search.data.results} sessionId={sessionId} />
          </div>
        )}
        {search.data?.results && search.data.results.length === 0 && (
          <p className="text-center text-slate-500 mt-8">No matching tours found. Try a different photo.</p>
        )}
      </section>
    </PageShell>
  );
}
