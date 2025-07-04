
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ShopProfile {
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
}

export const useShopProfile = () => {
  return useQuery({
    queryKey: ["shop_profile"],
    queryFn: async () => {
      console.log("Fetching shop profile from Supabase...");
      const { data, error } = await supabase
        .from("shop_settings")
        .select("setting_value")
        .eq("setting_key", "shop_profile")
        .single();

      if (error) {
        console.error("Error fetching shop profile:", error);
        throw error;
      }

      console.log("Shop profile fetched:", data);
      return data.setting_value as ShopProfile;
    },
  });
};

export const useUpdateShopProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profileData: ShopProfile) => {
      console.log("Updating shop profile:", profileData);
      const { data, error } = await supabase
        .from("shop_settings")
        .update({ setting_value: profileData })
        .eq("setting_key", "shop_profile")
        .select()
        .single();

      if (error) {
        console.error("Error updating shop profile:", error);
        throw error;
      }

      console.log("Shop profile updated:", data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shop_profile"] });
      toast.success("Shop profile updated successfully");
    },
    onError: (error) => {
      console.error("Failed to update shop profile:", error);
      toast.error("Failed to update shop profile");
    },
  });
};
