
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useShopBasicInfo = () => {
  return useQuery({
    queryKey: ["shop-basic-info"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shop_profile")
        .select("shop_name, tagline, short_desc")
        .single();

      if (error) throw error;
      return data;
    },
  });
};

export const useShopAboutInfo = () => {
  return useQuery({
    queryKey: ["shop-about-info"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shop_profile")
        .select("about_desc")
        .single();

      if (error) throw error;
      return data;
    },
  });
};

export const useShopContactInfo = () => {
  return useQuery({
    queryKey: ["shop-contact-info"],
    queryFn: async () => {
      // Get profile ID first
      const { data: profile, error: profileError } = await supabase
        .from("shop_profile")
        .select("id")
        .single();

      if (profileError) throw profileError;

      // Get contacts and location
      const [contactsResult, locationResult] = await Promise.all([
        supabase
          .from("contact_numbers")
          .select("type, label, number")
          .eq("profile_id", profile.id),
        supabase
          .from("locations")
          .select("address, google_maps_url, latitude, longitude")
          .eq("profile_id", profile.id)
          .maybeSingle()
      ]);

      if (contactsResult.error) throw contactsResult.error;
      if (locationResult.error) throw locationResult.error;

      return {
        contacts: contactsResult.data || [],
        location: locationResult.data
      };
    },
  });
};

export const useShopSocialLinks = () => {
  return useQuery({
    queryKey: ["shop-social-links"],
    queryFn: async () => {
      // Get profile ID first
      const { data: profile, error: profileError } = await supabase
        .from("shop_profile")
        .select("id")
        .single();

      if (profileError) throw profileError;

      const { data, error } = await supabase
        .from("social_links")
        .select("platform, url")
        .eq("profile_id", profile.id);

      if (error) throw error;
      return data || [];
    },
  });
};
