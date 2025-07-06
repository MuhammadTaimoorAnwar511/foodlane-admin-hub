
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
import AdminSidebar from "@/components/AdminSidebar";
import { toast } from "sonner";
import colors from "@/theme/colors";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { supabase } from "@/integrations/supabase/client";

interface ProductVariant {
  name: string;
  regularPrice: number;
  offerPrice: number;
}

interface ProductAddon {
  name: string;
  additionalPrice: number;
}

interface ProductFormData {
  name: string;
  category_id: string;
  description: string;
  image_url: string;
  stockType: 'unlimited' | 'fixed';
  stock_quantity?: number;
  is_available: boolean;
  pricingMode: 'single' | 'variants';
  price?: number;
  variants: ProductVariant[];
  addons: ProductAddon[];
  enableAddons: boolean;
}

const Products = () => {
  const navigate = useNavigate();
  const { data: products = [], isLoading, refetch } = useProducts();
  const { data: categories = [] } = useCategories();
  
  const [showDialog, setShowDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    category_id: "",
    description: "",
    image_url: "",
    stockType: 'unlimited',
    stock_quantity: undefined,
    is_available: true,
    pricingMode: 'single',
    price: undefined,
    variants: [],
    addons: [],
    enableAddons: false
  });

  const [newVariant, setNewVariant] = useState({ 
    name: "", 
    regularPrice: "", 
    offerPrice: "" 
  });
  
  const [newAddon, setNewAddon] = useState({ 
    name: "", 
    additionalPrice: "" 
  });

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("adminLoggedIn");
    if (!isLoggedIn) {
      navigate("/admin-login");
    }
  }, [navigate]);

  const validateForm = (): boolean => {
    // Basic field validation
    if (!formData.name.trim()) {
      toast.error("Product name is required");
      return false;
    }
    
    if (!formData.category_id) {
      toast.error("Category is required");
      return false;
    }
    
    if (!formData.description.trim()) {
      toast.error("Description is required");
      return false;
    }
    
    if (!formData.image_url.trim()) {
      toast.error("Image URL is required");
      return false;
    }

    // Stock validation
    if (formData.stockType === 'fixed') {
      if (!formData.stock_quantity || formData.stock_quantity < 0) {
        toast.error("Stock quantity must be ≥ 0 for fixed units");
        return false;
      }
    }

    // Pricing validation
    if (formData.pricingMode === 'single') {
      if (!formData.price || formData.price < 0) {
        toast.error("Price must be ≥ 0");
        return false;
      }
    } else if (formData.pricingMode === 'variants') {
      if (formData.variants.length === 0) {
        toast.error("At least one variant is required");
        return false;
      }
      
      // Validate each variant
      for (const variant of formData.variants) {
        if (variant.regularPrice < 0) {
          toast.error(`Regular price must be ≥ 0 for variant "${variant.name}"`);
          return false;
        }
        if (variant.offerPrice < 0) {
          toast.error(`Offer price must be ≥ 0 for variant "${variant.name}"`);
          return false;
        }
        if (variant.offerPrice > variant.regularPrice) {
          toast.error(`Offer price must be ≤ regular price for variant "${variant.name}"`);
          return false;
        }
      }
    }

    // Add-ons validation
    if (formData.enableAddons) {
      for (const addon of formData.addons) {
        if (addon.additionalPrice < 0) {
          toast.error(`Additional price must be ≥ 0 for add-on "${addon.name}"`);
          return false;
        }
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare variants data
      const variantsData = formData.pricingMode === 'variants' ? 
        formData.variants.map(v => ({
          name: v.name,
          price: v.regularPrice,
          offer_price: v.offerPrice
        })) : [];

      // Prepare addons data
      const addonsData = formData.enableAddons ? 
        formData.addons.map(a => ({
          name: a.name,
          price: a.additionalPrice
        })) : [];

      const productData = {
        name: formData.name,
        category_id: formData.category_id,
        description: formData.description,
        image_url: formData.image_url,
        price: formData.pricingMode === 'single' ? formData.price : 0,
        stock_quantity: formData.stockType === 'fixed' ? formData.stock_quantity : null,
        is_available: formData.stockType === 'fixed' ? 
          (formData.stock_quantity! > 0) : formData.is_available,
        variants: {
          pricing_mode: formData.pricingMode,
          variants: variantsData,
          addons: addonsData
        }
      };

      let result;
      if (editingProduct) {
        result = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from('products')
          .insert([productData])
          .select()
          .single();
      }

      if (result.error) {
        throw result.error;
      }

      toast.success(editingProduct ? "Product updated successfully!" : "Product added successfully!");
      setShowDialog(false);
      resetForm();
      refetch();
      
    } catch (error: any) {
      console.error("Error saving product:", error);
      toast.error(`Failed to ${editingProduct ? 'update' : 'add'} product: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      category_id: "",
      description: "",
      image_url: "",
      stockType: 'unlimited',
      stock_quantity: undefined,
      is_available: true,
      pricingMode: 'single',
      price: undefined,
      variants: [],
      addons: [],
      enableAddons: false
    });
    setNewVariant({ name: "", regularPrice: "", offerPrice: "" });
    setNewAddon({ name: "", additionalPrice: "" });
    setEditingProduct(null);
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    
    const variants = product.variants?.variants || [];
    const addons = product.variants?.addons || [];
    
    setFormData({
      name: product.name,
      category_id: product.category_id || "",
      description: product.description || "",
      image_url: product.image_url || "",
      stockType: product.stock_quantity !== null ? 'fixed' : 'unlimited',
      stock_quantity: product.stock_quantity || undefined,
      is_available: product.is_available,
      pricingMode: product.variants?.pricing_mode || 'single',
      price: product.price || undefined,
      variants: variants.map((v: any) => ({
        name: v.name,
        regularPrice: v.price,
        offerPrice: v.offer_price
      })),
      addons: addons.map((a: any) => ({
        name: a.name,
        additionalPrice: a.price
      })),
      enableAddons: addons.length > 0
    });
    
    setShowDialog(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success("Product deleted successfully!");
      refetch();
    } catch (error: any) {
      console.error("Error deleting product:", error);
      toast.error(`Failed to delete product: ${error.message}`);
    }
  };

  const toggleAvailability = async (id: string, currentAvailability: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_available: !currentAvailability })
        .eq('id', id);

      if (error) throw error;

      toast.success(`Product marked as ${!currentAvailability ? 'Available' : 'Out of Stock'}`);
      refetch();
    } catch (error: any) {
      console.error("Error updating availability:", error);
      toast.error(`Failed to update availability: ${error.message}`);
    }
  };

  const updateStock = async (id: string, newStock: number) => {
    if (newStock < 0) {
      toast.error("Stock quantity must be ≥ 0");
      return;
    }

    try {
      const { error } = await supabase
        .from('products')
        .update({ 
          stock_quantity: newStock,
          is_available: newStock > 0
        })
        .eq('id', id);

      if (error) throw error;

      toast.success("Stock updated successfully!");
      refetch();
    } catch (error: any) {
      console.error("Error updating stock:", error);
      toast.error(`Failed to update stock: ${error.message}`);
    }
  };

  const addVariant = () => {
    const regularPrice = parseFloat(newVariant.regularPrice);
    const offerPrice = parseFloat(newVariant.offerPrice);

    if (!newVariant.name || !newVariant.regularPrice || !newVariant.offerPrice) {
      toast.error("All variant fields are required");
      return;
    }

    if (regularPrice < 0) {
      toast.error("Regular price must be ≥ 0");
      return;
    }

    if (offerPrice < 0) {
      toast.error("Offer price must be ≥ 0");
      return;
    }

    if (offerPrice > regularPrice) {
      toast.error("Offer price must be ≤ regular price");
      return;
    }

    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, {
        name: newVariant.name,
        regularPrice,
        offerPrice
      }]
    }));
    setNewVariant({ name: "", regularPrice: "", offerPrice: "" });
  };

  const removeVariant = (index: number) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }));
  };

  const addAddon = () => {
    const additionalPrice = parseFloat(newAddon.additionalPrice);

    if (!newAddon.name || !newAddon.additionalPrice) {
      toast.error("All add-on fields are required");
      return;
    }

    if (additionalPrice < 0) {
      toast.error("Additional price must be ≥ 0");
      return;
    }

    setFormData(prev => ({
      ...prev,
      addons: [...prev.addons, {
        name: newAddon.name,
        additionalPrice
      }]
    }));
    setNewAddon({ name: "", additionalPrice: "" });
  };

  const removeAddon = (index: number) => {
    setFormData(prev => ({
      ...prev,
      addons: prev.addons.filter((_, i) => i !== index)
    }));
  };

  const getDisplayPrice = (product: any) => {
    const variants = product.variants?.variants || [];
    if (variants.length > 0) {
      const lowest = Math.min(...variants.map((v: any) => v.offer_price));
      return `From PKR ${lowest}`;
    }
    return `PKR ${product.price}`;
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen" style={{ backgroundColor: colors.backgrounds.main }}>
        <AdminSidebar />
        <main className="flex-1 p-6 flex items-center justify-center">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading products...</span>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: colors.backgrounds.main }}>
      <AdminSidebar />
      
      <main className="flex-1 p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Products</h1>
            <p className="text-gray-600">Manage your food items and menu</p>
          </div>
          
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button style={{ backgroundColor: colors.primary[500] }} className="hover:opacity-90" onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? "Edit Product" : "Add New Product"}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Product Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.category_id}
                      onValueChange={(value) => setFormData({...formData, category_id: value})}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="image">Image URL *</Label>
                  <Input
                    id="image"
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={formData.image_url}
                    onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                    required
                  />
                </div>

                {/* Stock Management Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Stock Management</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <RadioGroup
                        value={formData.stockType}
                        onValueChange={(value: 'unlimited' | 'fixed') => setFormData({...formData, stockType: value})}
                        className="flex items-center space-x-6"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="unlimited" id="unlimited" />
                          <Label htmlFor="unlimited">Unlimited</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="fixed" id="fixed" />
                          <Label htmlFor="fixed">Fixed units</Label>
                        </div>
                      </RadioGroup>
                      
                      {formData.stockType === 'fixed' && (
                        <div className="flex items-center space-x-2">
                          <Label htmlFor="quantity">Quantity:</Label>
                          <Input
                            id="quantity"
                            type="number"
                            min="0"
                            value={formData.stock_quantity || ""}
                            onChange={(e) => setFormData({...formData, stock_quantity: parseInt(e.target.value) || 0})}
                            className="w-24"
                            required
                          />
                        </div>
                      )}
                    </div>

                    {formData.stockType === 'unlimited' && (
                      <div className="flex items-center space-x-2 mt-4">
                        <Switch
                          id="availability"
                          checked={formData.is_available}
                          onCheckedChange={(checked) => setFormData({...formData, is_available: checked})}
                        />
                        <Label htmlFor="availability">
                          Product Available {formData.is_available ? '(In Stock)' : '(Out of Stock)'}
                        </Label>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Pricing Mode Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Pricing Mode</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                      <button
                        type="button"
                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                          formData.pricingMode === 'single'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                        onClick={() => setFormData({...formData, pricingMode: 'single'})}
                      >
                        Single price (no variants)
                      </button>
                      <button
                        type="button"
                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                          formData.pricingMode === 'variants'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                        onClick={() => setFormData({...formData, pricingMode: 'variants'})}
                      >
                        Has variants
                      </button>
                    </div>
                  </CardContent>
                </Card>

                {/* Base Pricing Card - Show only when single pricing mode */}
                {formData.pricingMode === 'single' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Base Pricing</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div>
                        <Label htmlFor="price">Price (PKR) *</Label>
                        <Input
                          id="price"
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.price || ""}
                          onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                          required
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Variants Table - Show only when variants pricing mode */}
                {formData.pricingMode === 'variants' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Variants</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-4 gap-2 items-end">
                          <div>
                            <Label>Variant Name</Label>
                            <Input
                              placeholder="e.g., Small, Large"
                              value={newVariant.name}
                              onChange={(e) => setNewVariant({...newVariant, name: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label>Regular Price (PKR)</Label>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={newVariant.regularPrice}
                              onChange={(e) => setNewVariant({...newVariant, regularPrice: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label>Offer Price (PKR)</Label>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={newVariant.offerPrice}
                              onChange={(e) => setNewVariant({...newVariant, offerPrice: e.target.value})}
                            />
                          </div>
                          <Button type="button" onClick={addVariant} style={{ backgroundColor: colors.primary[500] }}>
                            Add
                          </Button>
                        </div>

                        {formData.variants.length > 0 && (
                          <div className="border rounded-lg overflow-hidden">
                            <table className="w-full">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-4 py-2 text-left">Variant Name</th>
                                  <th className="px-4 py-2 text-left">Regular Price</th>
                                  <th className="px-4 py-2 text-left">Offer Price</th>
                                  <th className="px-4 py-2 text-center">Action</th>
                                </tr>
                              </thead>
                              <tbody>
                                {formData.variants.map((variant, index) => (
                                  <tr key={index} className="border-t">
                                    <td className="px-4 py-2">{variant.name}</td>
                                    <td className="px-4 py-2">PKR {variant.regularPrice}</td>
                                    <td className="px-4 py-2">PKR {variant.offerPrice}</td>
                                    <td className="px-4 py-2 text-center">
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeVariant(index)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Add-ons Section */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="enableAddons"
                      checked={formData.enableAddons}
                      onCheckedChange={(checked) => setFormData({...formData, enableAddons: checked === true})}
                    />
                    <Label htmlFor="enableAddons">Enable add-ons</Label>
                  </div>

                  {formData.enableAddons && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Add-ons</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="grid grid-cols-3 gap-2 items-end">
                            <div>
                              <Label>Add-on Name</Label>
                              <Input
                                placeholder="e.g., Extra Cheese"
                                value={newAddon.name}
                                onChange={(e) => setNewAddon({...newAddon, name: e.target.value})}
                              />
                            </div>
                            <div>
                              <Label>Additional Price (PKR)</Label>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={newAddon.additionalPrice}
                                onChange={(e) => setNewAddon({...newAddon, additionalPrice: e.target.value})}
                              />
                            </div>
                            <Button type="button" onClick={addAddon} style={{ backgroundColor: colors.primary[500] }}>
                              Add
                            </Button>
                          </div>

                          {formData.addons.length > 0 && (
                            <div className="border rounded-lg overflow-hidden">
                              <table className="w-full">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th className="px-4 py-2 text-left">Add-on Name</th>
                                    <th className="px-4 py-2 text-left">Additional Price</th>
                                    <th className="px-4 py-2 text-center">Action</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {formData.addons.map((addon, index) => (
                                    <tr key={index} className="border-t">
                                      <td className="px-4 py-2">{addon.name}</td>
                                      <td className="px-4 py-2">PKR {addon.additionalPrice}</td>
                                      <td className="px-4 py-2 text-center">
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => removeAddon(index)}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="ghost" onClick={() => setShowDialog(false)}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    style={{ backgroundColor: colors.primary[500] }} 
                    className="hover:opacity-90"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        {editingProduct ? "Updating..." : "Adding..."}
                      </>
                    ) : (
                      editingProduct ? "Update Product" : "Add Product"
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow" style={{ backgroundColor: colors.backgrounds.card }}>
              <div className="relative">
                <img
                  src={product.image_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop"}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
                <Badge 
                  className={`absolute top-2 right-2 ${
                    product.is_available ? 'bg-green-500' : 'bg-red-500'
                  }`}
                >
                  {product.is_available ? 'Available' : 'Out of Stock'}
                </Badge>
              </div>
              
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                
                {/* Stock Display */}
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Stock:</span>
                  <span className="text-sm font-medium">
                    {product.stock_quantity !== null ? `${product.stock_quantity} units` : '∞'}
                  </span>
                </div>

                {/* Stock Management for Fixed Stock */}
                {product.stock_quantity !== null && (
                  <div className="flex items-center gap-2 mb-3">
                    <Input
                      type="number"
                      min="0"
                      value={product.stock_quantity}
                      onChange={(e) => updateStock(product.id, parseInt(e.target.value) || 0)}
                      className="w-20 h-8 text-sm"
                    />
                    <Label className="text-xs text-gray-500">units</Label>
                  </div>
                )}
                
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <span className="text-lg font-bold" style={{ color: colors.primary[500] }}>
                      {getDisplayPrice(product)}
                    </span>
                  </div>
                </div>
                
                <div className="flex space-x-2 mb-2">
                  <Button
                    size="sm"
                    variant={product.is_available ? "outline" : "default"}
                    onClick={() => toggleAvailability(product.id, product.is_available)}
                    className="flex-1"
                    style={!product.is_available ? { backgroundColor: colors.status.success } : {}}
                    disabled={product.stock_quantity === 0 && !product.is_available}
                  >
                    {product.is_available ? 'Mark Out of Stock' : 'Mark Available'}
                  </Button>
                </div>

                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(product)}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(product.id)}
                    className="flex-1"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Products;
