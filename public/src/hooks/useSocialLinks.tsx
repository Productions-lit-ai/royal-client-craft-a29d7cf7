import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SocialLinks {
  instagram: string;
  x: string;
  tiktok: string;
}

const DEFAULT_LINKS: SocialLinks = {
  instagram: "",
  x: "",
  tiktok: "",
};

export function useSocialLinks() {
  const [links, setLinks] = useState<SocialLinks>(DEFAULT_LINKS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    const { data, error } = await supabase
      .from("site_settings")
      .select("key, value")
      .in("key", ["social_instagram", "social_x", "social_tiktok"]);

    if (!error && data) {
      const newLinks = { ...DEFAULT_LINKS };
      data.forEach((item) => {
        if (item.key === "social_instagram") newLinks.instagram = item.value || "";
        if (item.key === "social_x") newLinks.x = item.value || "";
        if (item.key === "social_tiktok") newLinks.tiktok = item.value || "";
      });
      setLinks(newLinks);
    }
    setLoading(false);
  };

  const updateLink = async (platform: keyof SocialLinks, url: string) => {
    const key = `social_${platform}`;
    
    // Upsert: try update first, then insert if not found
    const { data: existing } = await supabase
      .from("site_settings")
      .select("id")
      .eq("key", key)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from("site_settings")
        .update({ value: url, updated_at: new Date().toISOString() })
        .eq("key", key);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from("site_settings")
        .insert({ key, value: url });
      if (error) throw error;
    }

    setLinks((prev) => ({ ...prev, [platform]: url }));
  };

  return { links, loading, updateLink, refetch: fetchLinks };
}
