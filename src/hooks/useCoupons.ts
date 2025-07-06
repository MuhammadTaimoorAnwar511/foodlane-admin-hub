import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Coupon {
  id: string;
  code: string;
  name: string;
  description?: string;
  discount_type: "percentage" | "fixed_amount";
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
      
      // Frontend validation
      if (couponData.discount_type === "percentage" && (couponData.discount_value < 0 || couponData.discount_value > 100)) {
        throw new Error("Percentage discount must be between 0 and 100");
      }
      
      if (couponData.discount_type === "fixed_amount" && couponData.discount_value < 0) {
        throw new Error("Fixed amount discount must be greater than or equal to 0");
      }
      
      if (couponData.min_order_amount && couponData.min_order_amount < 0) {
        throw new Error("Minimum order amount must be greater than or equal to 0");
      }
      
      if (couponData.usage_limit && couponData.usage_limit < 0) {
        throw new Error("Usage limit must be greater than or equal to 0");
      }
      
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
      toast.error(error.message || "Failed to create coupon");
    },
  });
};

export const useUpdateCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...couponData }: Partial<Coupon> & { id: string }) => {
      console.log("Updating coupon:", id, couponData);
      
      // Frontend validation
      if (couponData.discount_type === "percentage" && couponData.discount_value !== undefined && (couponData.discount_value < 0 || couponData.discount_value > 100)) {
        throw new Error("Percentage discount must be between 0 and 100");
      }
      
      if (couponData.discount_type === "fixed_amount" && couponData.discount_value !== undefined && couponData.discount_value < 0) {
        throw new Error("Fixed amount discount must be greater than or equal to 0");
      }
      
      if (couponData.min_order_amount !== undefined && couponData.min_order_amount < 0) {
        throw new Error("Minimum order amount must be greater than or equal to 0");
      }
      
      if (couponData.usage_limit !== undefined && couponData.usage_limit < 0) {
        throw new Error("Usage limit must be greater than or equal to 0");
      }
      
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
      toast.error(error.message || "Failed to update coupon");
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
