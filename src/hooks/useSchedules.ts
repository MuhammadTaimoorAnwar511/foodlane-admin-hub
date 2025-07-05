
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface TimeBlock {
  id: string;
  startTime: string;
  endTime: string;
}

export interface Schedule {
  id: string;
  day_of_week: number;
  is_closed: boolean;
  is_24h: boolean;
  time_blocks: TimeBlock[];
  created_at?: string;
  updated_at?: string;
}

export const useSchedules = () => {
  return useQuery({
    queryKey: ["schedules"],
    queryFn: async () => {
      console.log("Fetching schedules from Supabase...");
      const { data, error } = await supabase
        .from("schedules")
        .select("*")
        .order("day_of_week", { ascending: true });

      if (error) {
        console.error("Error fetching schedules:", error);
        throw error;
      }

      console.log("Schedules fetched:", data);
      
      // Convert the Json time_blocks to TimeBlock[] type
      const schedules = data.map(schedule => ({
        ...schedule,
        time_blocks: (schedule.time_blocks as unknown as TimeBlock[]) || []
      }));
      
      return schedules as Schedule[];
    },
  });
};

export const useUpdateSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...scheduleData }: Partial<Schedule> & { id: string }) => {
      console.log("Updating schedule:", id, scheduleData);
      
      // Convert TimeBlock[] to Json for database storage
      const updateData = {
        ...scheduleData,
        time_blocks: (scheduleData.time_blocks || []) as unknown as any
      };
      
      const { data, error } = await supabase
        .from("schedules")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating schedule:", error);
        throw error;
      }

      console.log("Schedule updated:", data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      toast.success("Schedule updated successfully");
    },
    onError: (error) => {
      console.error("Failed to update schedule:", error);
      toast.error("Failed to update schedule");
    },
  });
};

export const useGlobalShopStatus = () => {
  return useQuery({
    queryKey: ["global_shop_status"],
    queryFn: async () => {
      console.log("Fetching global shop status from Supabase...");
      const { data, error } = await supabase
        .from("shop_settings")
        .select("setting_value")
        .eq("setting_key", "global_shop_status")
        .single();

      if (error) {
        console.error("Error fetching global shop status:", error);
        throw error;
      }

      console.log("Global shop status fetched:", data);
      return data.setting_value as { isOpen: boolean; closedMessage: string };
    },
  });
};

export const useUpdateGlobalShopStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (statusData: { isOpen: boolean; closedMessage: string }) => {
      console.log("Updating global shop status:", statusData);
      const { data, error } = await supabase
        .from("shop_settings")
        .update({ setting_value: statusData as unknown as any })
        .eq("setting_key", "global_shop_status")
        .select()
        .single();

      if (error) {
        console.error("Error updating global shop status:", error);
        throw error;
      }

      console.log("Global shop status updated:", data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["global_shop_status"] });
      toast.success("Shop status updated successfully");
    },
    onError: (error) => {
      console.error("Failed to update shop status:", error);
      toast.error("Failed to update shop status");
    },
  });
};
