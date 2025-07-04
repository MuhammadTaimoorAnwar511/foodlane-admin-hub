
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface DeliverySettings {
  deliveryFee: number;
  freeDeliveryThreshold: number;
  deliveryRadius: number;
  estimatedDeliveryTime: number;
  enableFreeDelivery: boolean;
}

export const useDeliverySettings = () => {
  return useQuery({
    queryKey: ["delivery-settings"],
    queryFn: async () => {
      console.log("Fetching delivery settings from Supabase...");
      const { data, error } = await supabase
        .from("shop_settings")
        .select("setting_value")
        .eq("setting_key", "delivery_settings")
        .single();

      if (error) {
        console.error("Error fetching delivery settings:", error);
        throw error;
      }

      console.log("Delivery settings fetched:", data);
      return data.setting_value as unknown as DeliverySettings;
    },
  });
};

export const useUpdateDeliverySettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: DeliverySettings) => {
      console.log("Updating delivery settings:", settings);
      const { data, error } = await supabase
        .from("shop_settings")
        .update({ setting_value: settings as any })
        .eq("setting_key", "delivery_settings")
        .select()
        .single();

      if (error) {
        console.error("Error updating delivery settings:", error);
        throw error;
      }

      console.log("Delivery settings updated:", data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["delivery-settings"] });
      toast.success("Delivery settings updated successfully");
    },
    onError: (error) => {
      console.error("Failed to update delivery settings:", error);
      toast.error("Failed to update delivery settings");
    },
  });
};
