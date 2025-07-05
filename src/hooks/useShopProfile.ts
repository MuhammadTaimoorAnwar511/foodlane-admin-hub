
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ShopProfile {
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  social_links?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
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
        .maybeSingle();

      if (error) {
        console.error("Error fetching shop profile:", error);
        throw error;
      }

      console.log("Shop profile fetched:", data);
      
      // Return the setting_value as ShopProfile, or default values if not found
      if (!data) {
        return {
          name: "FastFood Delight",
          description: "We serve the best fast food in town with fresh ingredients and quick delivery.",
          address: "123 Main Street, City Center",
          phone: "+1234567890",
          email: "info@fastfooddelight.com",
          website: "",
          social_links: {}
        } as ShopProfile;
      }
      
      return data.setting_value as unknown as ShopProfile;
    },
  });
};

export const useUpdateShopProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profileData: ShopProfile) => {
      console.log("Updating shop profile:", profileData);
      
      // First check if shop_profile setting exists
      const { data: existingData } = await supabase
        .from("shop_settings")
        .select("id")
        .eq("setting_key", "shop_profile")
        .maybeSingle();

      let result;
      
      if (existingData) {
        // Update existing record
        const { data, error } = await supabase
          .from("shop_settings")
          .update({ setting_value: profileData as unknown as any })
          .eq("setting_key", "shop_profile")
          .select()
          .single();
          
        if (error) throw error;
        result = data;
      } else {
        // Insert new record
        const { data, error } = await supabase
          .from("shop_settings")
          .insert({
            setting_key: "shop_profile",
            setting_value: profileData as unknown as any
          })
          .select()
          .single();
          
        if (error) throw error;
        result = data;
      }

      console.log("Shop profile updated:", result);
      return result;
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
