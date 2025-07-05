
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface DeliverySettings {
  minDeliveryTime: number;
  maxDeliveryTime: number;
  deliveryCharges: number;
  enableFreeDelivery: boolean;
  freeDeliveryThreshold: number;
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
        .maybeSingle();

      if (error) {
        console.error("Error fetching delivery settings:", error);
        throw error;
      }

      // If no settings exist, return default values
      if (!data) {
        console.log("No delivery settings found, returning defaults");
        const defaultSettings: DeliverySettings = {
          minDeliveryTime: 25,
          maxDeliveryTime: 30,
          deliveryCharges: 150,
          enableFreeDelivery: false,
          freeDeliveryThreshold: 1000
        };
        return defaultSettings;
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
      
      // Validation: max delivery time must be greater than min delivery time
      if (settings.maxDeliveryTime <= settings.minDeliveryTime) {
        throw new Error("Max delivery time must be greater than min delivery time");
      }
      
      // First check if settings exist
      const { data: existingData } = await supabase
        .from("shop_settings")
        .select("id")
        .eq("setting_key", "delivery_settings")
        .maybeSingle();

      if (existingData) {
        // Update existing settings
        const { data, error } = await supabase
          .from("shop_settings")
          .update({ setting_value: settings as unknown as any })
          .eq("setting_key", "delivery_settings")
          .select()
          .single();

        if (error) {
          console.error("Error updating delivery settings:", error);
          throw error;
        }

        console.log("Delivery settings updated:", data);
        return data;
      } else {
        // Create new settings
        const { data, error } = await supabase
          .from("shop_settings")
          .insert({
            setting_key: "delivery_settings",
            setting_value: settings as unknown as any
          })
          .select()
          .single();

        if (error) {
          console.error("Error creating delivery settings:", error);
          throw error;
        }

        console.log("Delivery settings created:", data);
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["delivery-settings"] });
      toast.success("Delivery settings updated successfully");
    },
    onError: (error) => {
      console.error("Failed to update delivery settings:", error);
      toast.error(error.message || "Failed to update delivery settings");
    },
  });
};
