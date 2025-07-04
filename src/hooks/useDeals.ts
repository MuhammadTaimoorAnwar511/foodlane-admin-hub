
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Deal {
  id: string;
  name: string;
  category: string;
  status: "active" | "draft" | "ended";
  items: { product: string; quantity: number; variant?: string }[];
  price: number;
  offer_price?: number;
  pricing_mode: "fixed" | "calculated";
  discount_percent?: number;
  count_stock: boolean;
  image_url?: string;
  start_date?: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
  created_at?: string;
  updated_at?: string;
}

export const useDeals = () => {
  return useQuery({
    queryKey: ["deals"],
    queryFn: async () => {
      console.log("Fetching deals from Supabase...");
      const { data, error } = await supabase
        .from("deals")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching deals:", error);
        throw error;
      }

      console.log("Deals fetched:", data);
      return data as Deal[];
    },
  });
};

export const useCreateDeal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dealData: Omit<Deal, "id" | "created_at" | "updated_at">) => {
      console.log("Creating deal:", dealData);
      const { data, error } = await supabase
        .from("deals")
        .insert([dealData])
        .select()
        .single();

      if (error) {
        console.error("Error creating deal:", error);
        throw error;
      }

      console.log("Deal created:", data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deals"] });
      toast.success("Deal created successfully");
    },
    onError: (error) => {
      console.error("Failed to create deal:", error);
      toast.error("Failed to create deal");
    },
  });
};

export const useUpdateDeal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...dealData }: Partial<Deal> & { id: string }) => {
      console.log("Updating deal:", id, dealData);
      const { data, error } = await supabase
        .from("deals")
        .update(dealData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating deal:", error);
        throw error;
      }

      console.log("Deal updated:", data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deals"] });
      toast.success("Deal updated successfully");
    },
    onError: (error) => {
      console.error("Failed to update deal:", error);
      toast.error("Failed to update deal");
    },
  });
};

export const useDeleteDeal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      console.log("Deleting deal:", id);
      const { error } = await supabase
        .from("deals")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting deal:", error);
        throw error;
      }

      console.log("Deal deleted:", id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deals"] });
      toast.success("Deal deleted successfully");
    },
    onError: (error) => {
      console.error("Failed to delete deal:", error);
      toast.error("Failed to delete deal");
    },
  });
};

export const useBulkDeleteDeals = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      console.log("Bulk deleting deals:", ids);
      const { error } = await supabase
        .from("deals")
        .delete()
        .in("id", ids);

      if (error) {
        console.error("Error bulk deleting deals:", error);
        throw error;
      }

      console.log("Deals bulk deleted:", ids);
    },
    onSuccess: (_, ids) => {
      queryClient.invalidateQueries({ queryKey: ["deals"] });
      toast.success(`${ids.length} deals deleted successfully`);
    },
    onError: (error) => {
      console.error("Failed to bulk delete deals:", error);
      toast.error("Failed to delete deals");
    },
  });
};
