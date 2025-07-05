
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ShopProfileData {
  id?: string;
  shop_name: string;
  tagline?: string;
  short_desc?: string;
  about_desc?: string;
}

export interface ContactNumber {
  id?: string;
  type: 'phone' | 'whatsapp';
  label?: string;
  number: string;
}

export interface SocialLink {
  id?: string;
  platform: string;
  url: string;
}

export interface Location {
  id?: string;
  address: string;
  latitude?: number;
  longitude?: number;
  google_maps_url?: string;
}

export interface CompleteShopProfile {
  profile: ShopProfileData;
  contacts: ContactNumber[];
  socials: SocialLink[];
  location: Location | null;
}

export const useCompleteShopProfile = () => {
  return useQuery({
    queryKey: ["complete-shop-profile"],
    queryFn: async (): Promise<CompleteShopProfile> => {
      console.log("Fetching complete shop profile...");
      
      // Fetch shop profile
      const { data: profile, error: profileError } = await supabase
        .from("shop_profile")
        .select("*")
        .single();

      if (profileError) {
        console.error("Error fetching shop profile:", profileError);
        throw profileError;
      }

      // Fetch contact numbers
      const { data: contacts, error: contactsError } = await supabase
        .from("contact_numbers")
        .select("*")
        .eq("profile_id", profile.id);

      if (contactsError) {
        console.error("Error fetching contacts:", contactsError);
        throw contactsError;
      }

      // Fetch social links
      const { data: socials, error: socialsError } = await supabase
        .from("social_links")
        .select("*")
        .eq("profile_id", profile.id);

      if (socialsError) {
        console.error("Error fetching socials:", socialsError);
        throw socialsError;
      }

      // Fetch location
      const { data: location, error: locationError } = await supabase
        .from("locations")
        .select("*")
        .eq("profile_id", profile.id)
        .maybeSingle();

      if (locationError) {
        console.error("Error fetching location:", locationError);
        throw locationError;
      }

      console.log("Complete shop profile fetched:", { profile, contacts, socials, location });
      
      return {
        profile,
        contacts: contacts || [],
        socials: socials || [],
        location
      };
    },
  });
};

export const useUpdateCompleteShopProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CompleteShopProfile) => {
      console.log("Updating complete shop profile:", data);
      
      // Update shop profile
      const { data: updatedProfile, error: profileError } = await supabase
        .from("shop_profile")
        .update({
          shop_name: data.profile.shop_name,
          tagline: data.profile.tagline,
          short_desc: data.profile.short_desc,
          about_desc: data.profile.about_desc,
          updated_at: new Date().toISOString()
        })
        .eq("id", data.profile.id)
        .select()
        .single();

      if (profileError) {
        console.error("Error updating shop profile:", profileError);
        throw profileError;
      }

      const profileId = updatedProfile.id;

      // Update contact numbers - delete all and insert new ones
      await supabase
        .from("contact_numbers")
        .delete()
        .eq("profile_id", profileId);

      if (data.contacts.length > 0) {
        const { error: contactsError } = await supabase
          .from("contact_numbers")
          .insert(
            data.contacts.map(contact => ({
              profile_id: profileId,
              type: contact.type,
              label: contact.label,
              number: contact.number
            }))
          );

        if (contactsError) {
          console.error("Error updating contacts:", contactsError);
          throw contactsError;
        }
      }

      // Update social links - delete all and insert new ones
      await supabase
        .from("social_links")
        .delete()
        .eq("profile_id", profileId);

      if (data.socials.length > 0) {
        const { error: socialsError } = await supabase
          .from("social_links")
          .insert(
            data.socials.map(social => ({
              profile_id: profileId,
              platform: social.platform,
              url: social.url
            }))
          );

        if (socialsError) {
          console.error("Error updating socials:", socialsError);
          throw socialsError;
        }
      }

      // Update location - delete existing and insert new one if provided
      await supabase
        .from("locations")
        .delete()
        .eq("profile_id", profileId);

      if (data.location) {
        const { error: locationError } = await supabase
          .from("locations")
          .insert({
            profile_id: profileId,
            address: data.location.address,
            latitude: data.location.latitude,
            longitude: data.location.longitude,
            google_maps_url: data.location.google_maps_url
          });

        if (locationError) {
          console.error("Error updating location:", locationError);
          throw locationError;
        }
      }

      console.log("Complete shop profile updated successfully");
      return updatedProfile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["complete-shop-profile"] });
      toast.success("Shop profile updated successfully");
    },
    onError: (error) => {
      console.error("Failed to update shop profile:", error);
      toast.error("Failed to update shop profile");
    },
  });
};
