import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./useAuth";

export interface Holiday {
  holiday_id: string;
  user_id: string;
  date: string;
  holiday_type: string;
  reason: string | null;
  study_percentage?: number;
  is_partial?: boolean;
  created_at: string;
}

export function useHolidays() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["holidays", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("holidays")
        .select("*")
        .eq("user_id", user!.id)
        .order("date", { ascending: false });
      if (error) throw error;
      return data as Holiday[];
    },
    enabled: !!user,
  });

  const create = useMutation({
    mutationFn: async (input: {
      date: string;
      holiday_type?: string;
      reason?: string;
      study_percentage?: number;
    }) => {
      const holidayDate = new Date(input.date);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      sevenDaysAgo.setHours(0, 0, 0, 0);

      if (holidayDate < sevenDaysAgo) {
        throw new Error("Cannot mark holidays more than 7 days in the past");
      }

      const { data, error } = await supabase
        .from("holidays")
        .insert({
          user_id: user!.id,
          date: input.date,
          holiday_type: input.holiday_type ?? "Holiday",
          reason: input.reason,
          study_percentage: input.study_percentage ?? 0,
        })
        .select()
        .single();
      if (error) throw error;
      return data as Holiday;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["holidays"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });

  const update = useMutation({
    mutationFn: async ({
      id,
      ...input
    }: {
      id: string;
      date?: string;
      holiday_type?: string;
      reason?: string;
      study_percentage?: number;
    }) => {
      const { data, error } = await supabase
        .from("holidays")
        .update(input)
        .eq("holiday_id", id)
        .select()
        .single();
      if (error) throw error;
      return data as Holiday;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["holidays"] });
    },
  });

  const remove = useMutation({
    mutationFn: async (holidayId: string) => {
      const { error } = await supabase
        .from("holidays")
        .delete()
        .eq("holiday_id", holidayId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["holidays"] });
    },
  });

  return { ...query, holidays: query.data ?? [], create, update, remove };
}
