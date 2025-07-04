
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Coupon {
  id: string;
  code: string;
  name: string;
  description?: string;
  discount_type: "percentage" | "fixed_amount" | "free_delivery";
  discount_value: number;
  min_order_amount?: number;
  max_discount_amount?: number;
  usage_limit?: number;
  used_count: number;
  status: "active" | "inactive" | "expired";
  start_date?: string;
  end_date?: string;
  is_first_order_only: boolean;
  applicable_categories?: string[];
  created_at?: string;
  updated_at?: string;
}

export const useCoupons = () => {
  return useQuery({
    queryKey: ["coupons"],
    queryFn: async () => {
      console.log("Fetching coupons from Supabase...");
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching coupons:", error);
        throw error;
      }

      console.log("Coupons fetched:", data);
      return data as Coupon[];
    },
  });
};

export const useCreateCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (couponData: Omit<Coupon, "id" | "created_at" | "updated_at">) => {
      console.log("Creating coupon:", couponData);
      const { data, error } = await supabase
        .from("coupons")
        .insert([couponData])
        .select()
        .single();

      if (error) {
        console.error("Error creating coupon:", error);
        throw error;
      }

      console.log("Coupon created:", data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
      toast.success("Coupon created successfully");
    },
    onError: (error) => {
      console.error("Failed to create coupon:", error);
      toast.error("Failed to create coupon");
    },
  });
};

export const useUpdateCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...couponData }: Partial<Coupon> & { id: string }) => {
      console.log("Updating coupon:", id, couponData);
      const { data, error } = await supabase
        .from("coupons")
        .update(couponData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating coupon:", error);
        throw error;
      }

      console.log("Coupon updated:", data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
      toast.success("Coupon updated successfully");
    },
    onError: (error) => {
      console.error("Failed to update coupon:", error);
      toast.error("Failed to update coupon");
    },
  });
};

export const useDeleteCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      console.log("Deleting coupon:", id);
      const { error } = await supabase
        .from("coupons")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting coupon:", error);
        throw error;
      }

      console.log("Coupon deleted:", id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
      toast.success("Coupon deleted successfully");
    },
    onError: (error) => {
      console.error("Failed to delete coupon:", error);
      toast.error("Failed to delete coupon");
    },
  });
};
