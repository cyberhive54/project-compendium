import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./useAuth";

export interface Journal {
  journal_id: string;
  user_id: string;
  date: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export function useJournals() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["journals", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("journals")
        .select("*")
        .eq("user_id", user!.id)
        .order("date", { ascending: false });
      if (error) throw error;
      return data as Journal[];
    },
    enabled: !!user,
  });

  const upsert = useMutation({
    mutationFn: async (input: { date: string; content: string }) => {
      const { data, error } = await supabase
        .from("journals")
        .upsert(
          {
            user_id: user!.id,
            date: input.date,
            content: input.content,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id,date" }
        )
        .select()
        .single();
      if (error) throw error;
      return data as Journal;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["journals"] });
    },
  });

  const remove = useMutation({
    mutationFn: async (journalId: string) => {
      const { error } = await supabase
        .from("journals")
        .delete()
        .eq("journal_id", journalId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["journals"] });
    },
  });

  return { ...query, journals: query.data ?? [], upsert, remove };
}
