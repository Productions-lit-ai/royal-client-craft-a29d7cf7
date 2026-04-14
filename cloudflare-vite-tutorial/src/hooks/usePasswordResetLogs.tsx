import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PasswordResetLog {
  id: string;
  email: string;
  status: string;
  created_at: string;
}

export function usePasswordResetLogs() {
  return useQuery({
    queryKey: ["password-reset-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("password_reset_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as PasswordResetLog[];
    },
  });
}
