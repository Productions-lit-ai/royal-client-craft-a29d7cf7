import { useState, useEffect } from "react";
import { useSocialLinks } from "@/hooks/useSocialLinks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Loader2 } from "lucide-react";
import { FaInstagram, FaXTwitter, FaTiktok } from "react-icons/fa6";
import { useToast } from "@/hooks/use-toast";

export default function SocialLinksManager() {
  const { links, loading } = useSocialLinks();
  const { toast } = useToast();
  const [formData, setFormData] = useState({ instagram: "", x: "", tiktok: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading) {
      setFormData({ ...links });
    }
  }, [loading, links]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { useSocialLinks } = await import("@/hooks/useSocialLinks");
      // Re-instantiate to call updateLink
      const { updateLink } = useSocialLinks();
      // Actually we need to use supabase directly here
      const { supabase } = await import("@/integrations/supabase/client");

      for (const [platform, url] of Object.entries(formData)) {
        const key = `social_${platform}`;
        const { data: existing } = await supabase
          .from("site_settings")
          .select("id")
          .eq("key", key)
          .maybeSingle();

        if (existing) {
          await supabase
            .from("site_settings")
            .update({ value: url, updated_at: new Date().toISOString() })
            .eq("key", key);
        } else {
          await supabase
            .from("site_settings")
            .insert({ key, value: url });
        }
      }

      toast({ title: "Social links saved", description: "Your social media links have been updated." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to save social links.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <FaInstagram className="h-5 w-5 text-pink-500" />
          <div className="flex-1">
            <Label htmlFor="instagram_url">Instagram URL</Label>
            <Input
              id="instagram_url"
              placeholder="https://instagram.com/yourprofile"
              value={formData.instagram}
              onChange={(e) => setFormData((prev) => ({ ...prev, instagram: e.target.value }))}
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <FaXTwitter className="h-5 w-5 text-foreground" />
          <div className="flex-1">
            <Label htmlFor="x_url">X (Twitter) URL</Label>
            <Input
              id="x_url"
              placeholder="https://x.com/yourprofile"
              value={formData.x}
              onChange={(e) => setFormData((prev) => ({ ...prev, x: e.target.value }))}
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <FaTiktok className="h-5 w-5 text-foreground" />
          <div className="flex-1">
            <Label htmlFor="tiktok_url">TikTok URL</Label>
            <Input
              id="tiktok_url"
              placeholder="https://tiktok.com/@yourprofile"
              value={formData.tiktok}
              onChange={(e) => setFormData((prev) => ({ ...prev, tiktok: e.target.value }))}
            />
          </div>
        </div>
      </div>

      <Button onClick={handleSave} disabled={saving} variant="hero">
        {saving ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save className="h-4 w-4 mr-2" />
            Save Social Links
          </>
        )}
      </Button>
    </div>
  );
}
