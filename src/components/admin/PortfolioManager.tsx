import { useState, useRef } from "react";
import { usePortfolio } from "@/hooks/usePortfolio";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Trash2, ExternalLink, Globe } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function PortfolioManager() {
  const { items, loading, addItem, deleteItem } = usePortfolio();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [screenshot, setScreenshot] = useState<File | undefined>();
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;
    setSubmitting(true);
    try {
      await addItem(title.trim(), url.trim(), screenshot);
      setTitle("");
      setUrl("");
      setScreenshot(undefined);
      if (fileRef.current) fileRef.current.value = "";
      setIsOpen(false);
      toast({ title: "Portfolio item added" });
    } catch {
      toast({ title: "Error", description: "Failed to add item.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteItem(id);
      toast({ title: "Item removed" });
    } catch {
      toast({ title: "Error", description: "Failed to delete.", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{items.length} item(s)</p>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="hero" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Portfolio Item</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div>
                <Label htmlFor="p-title">Website Name</Label>
                <Input id="p-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="My Client's Website" />
              </div>
              <div>
                <Label htmlFor="p-url">Website URL</Label>
                <Input id="p-url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com" type="url" />
              </div>
              <div>
                <Label htmlFor="p-screenshot">Screenshot (optional)</Label>
                <Input
                  id="p-screenshot"
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => setScreenshot(e.target.files?.[0])}
                />
              </div>
              <Button type="submit" variant="hero" className="w-full" disabled={!title.trim() || !url.trim() || submitting}>
                {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Adding...</> : "Add to Portfolio"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {items.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">No portfolio items yet.</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 p-4 rounded-lg border border-border bg-muted/30">
              <div className="w-16 h-10 rounded bg-muted overflow-hidden flex-shrink-0">
                {item.screenshot_url ? (
                  <img src={item.screenshot_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Globe className="h-4 w-4 text-muted-foreground/50" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{item.title}</p>
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                  {item.url} <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)} className="text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
