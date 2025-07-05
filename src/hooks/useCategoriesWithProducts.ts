
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface CategoryWithProductCount {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  product_count: number;
}

export const useCategoriesWithProducts = () => {
  return useQuery({
    queryKey: ["categories-with-products"],
    queryFn: async () => {
      console.log("Fetching categories with product counts...");
      
      // First fetch all categories
      const { data: categories, error: categoriesError } = await supabase
        .from("categories")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (categoriesError) {
        console.error("Error fetching categories:", categoriesError);
        throw categoriesError;
      }

      // Then get product counts for each category
      const categoriesWithCounts = await Promise.all(
        categories.map(async (category) => {
          const { count, error: countError } = await supabase
            .from("products")
            .select("*", { count: "exact", head: true })
            .eq("category_id", category.id)
            .eq("is_available", true);

          if (countError) {
            console.error(`Error counting products for category ${category.id}:`, countError);
            return { ...category, product_count: 0 };
          }

          return { ...category, product_count: count || 0 };
        })
      );

      console.log("Categories with product counts fetched:", categoriesWithCounts);
      return categoriesWithCounts as CategoryWithProductCount[];
    },
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (categoryData: { name: string; description?: string }) => {
      console.log("Creating category:", categoryData);
      const { data, error } = await supabase
        .from("categories")
        .insert({
          name: categoryData.name,
          description: categoryData.description,
          is_active: true
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating category:", error);
        throw error;
      }

      console.log("Category created:", data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories-with-products"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category created successfully");
    },
    onError: (error) => {
      console.error("Failed to create category:", error);
      toast.error("Failed to create category");
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...categoryData }: { id: string; name: string; description?: string }) => {
      console.log("Updating category:", id, categoryData);
      const { data, error } = await supabase
        .from("categories")
        .update({
          name: categoryData.name,
          description: categoryData.description,
          updated_at: new Date().toISOString()
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating category:", error);
        throw error;
      }

      console.log("Category updated:", data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories-with-products"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category updated successfully");
    },
    onError: (error) => {
      console.error("Failed to update category:", error);
      toast.error("Failed to update category");
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (categoryId: string) => {
      console.log("Deleting category:", categoryId);
      
      // First check if there are products in this category
      const { count } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("category_id", categoryId);

      if (count && count > 0) {
        throw new Error(`Cannot delete category with ${count} products. Please move or delete the products first.`);
      }

      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", categoryId);

      if (error) {
        console.error("Error deleting category:", error);
        throw error;
      }

      console.log("Category deleted successfully");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories-with-products"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category deleted successfully");
    },
    onError: (error) => {
      console.error("Failed to delete category:", error);
      toast.error(error.message || "Failed to delete category");
    },
  });
};
