import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export function useMyProfile() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["account", "profile", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function displayName(fullName: string | null | undefined, email: string | null | undefined) {
  const name = (fullName ?? "").trim();
  if (name) return name;
  const local = (email ?? "").split("@")[0] ?? "";
  return local ? local.replace(/[._-]+/g, " ").replace(/\b\w/g, c => c.toUpperCase()) : "Patient";
}

export function firstName(fullName: string | null | undefined, email: string | null | undefined) {
  return displayName(fullName, email).split(" ")[0] ?? "Patient";
}
