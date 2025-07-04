
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Rider {
  id: string;
  name: string;
  phone: string;
  password: string;
  status: "active" | "offline" | "busy";
  orders_completed: number;
  created_at?: string;
  updated_at?: string;
}

export const useRiders = () => {
  return useQuery({
    queryKey: ["riders"],
    queryFn: async () => {
      console.log("Fetching riders from Supabase...");
      const { data, error } = await supabase
        .from("riders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching riders:", error);
        throw error;
      }

      console.log("Riders fetched:", data);
      return data as Rider[];
    },
  });
};

export const useCreateRider = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (riderData: Omit<Rider, "id" | "created_at" | "updated_at">) => {
      console.log("Creating rider:", riderData);
      const { data, error } = await supabase
        .from("riders")
        .insert([riderData])
        .select()
        .single();

      if (error) {
        console.error("Error creating rider:", error);
        throw error;
      }

      console.log("Rider created:", data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["riders"] });
      toast.success("Rider created successfully");
    },
    onError: (error) => {
      console.error("Failed to create rider:", error);
      toast.error("Failed to create rider");
    },
  });
};

export const useUpdateRider = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...riderData }: Partial<Rider> & { id: string }) => {
      console.log("Updating rider:", id, riderData);
      const { data, error } = await supabase
        .from("riders")
        .update(riderData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating rider:", error);
        throw error;
      }

      console.log("Rider updated:", data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["riders"] });
      toast.success("Rider updated successfully");
    },
    onError: (error) => {
      console.error("Failed to update rider:", error);
      toast.error("Failed to update rider");
    },
  });
};

export const useDeleteRider = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      console.log("Deleting rider:", id);
      const { error } = await supabase
        .from("riders")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting rider:", error);
        throw error;
      }

      console.log("Rider deleted:", id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["riders"] });
      toast.success("Rider deleted successfully");
    },
    onError: (error) => {
      console.error("Failed to delete rider:", error);
      toast.error("Failed to delete rider");
    },
  });
};
