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
import { Plus, Edit, Trash2, X } from "lucide-react";
import AdminSidebar from "@/components/AdminSidebar";
import { toast } from "sonner";
import colors from "@/theme/colors";

interface ProductVariant {
  name: string;
  price: number;
  offerPrice: number;
}

interface ProductAddon {
  name: string;
  price: number;
}

interface Product {
  id: number;
  name: string;
  price: number;
  offerPrice: number;
  category: string;
  availability: boolean;
  description: string;
  variants: ProductVariant[];
  addons: ProductAddon[];
  image: string;
  stockType: 'unlimited' | 'fixed';
  unitsInStock?: number;
}

const Products = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([
    {
      id: 1,
      name: "Chicken Burger",
      price: 1299,
      offerPrice: 999,
      category: "Burgers",
      availability: true,
      description: "Juicy chicken burger with fresh lettuce and tomatoes",
      variants: [
        { name: "Regular", price: 1299, offerPrice: 999 },
        { name: "Large", price: 1599, offerPrice: 1299 }
      ],
      addons: [
        { name: "Extra Cheese", price: 150 },
        { name: "Extra Patty", price: 300 }
      ],
      image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop",
      stockType: 'unlimited'
    },
    {
      id: 2,
      name: "Margherita Pizza",
      price: 1599,
      offerPrice: 1299,
      category: "Pizza",
      availability: true,
      description: "Classic pizza with fresh mozzarella and basil",
      variants: [
        { name: "Small", price: 1299, offerPrice: 999 },
        { name: "Medium", price: 1599, offerPrice: 1299 },
        { name: "Large", price: 1999, offerPrice: 1599 }
      ],
      addons: [
        { name: "Extra Cheese", price: 200 },
        { name: "Olives", price: 150 },
        { name: "Mushrooms", price: 180 }
      ],
      image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop",
      stockType: 'fixed',
      unitsInStock: 25
    }
  ]);

  const [categories] = useState(["Burgers", "Pizza", "Chicken", "Beverages", "Desserts"]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    offerPrice: "",
    category: "",
    availability: true,
    description: "",
    image: "",
    stockType: 'unlimited' as 'unlimited' | 'fixed',
    unitsInStock: ""
  });
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [addons, setAddons] = useState<ProductAddon[]>([]);
  const [newVariant, setNewVariant] = useState({ name: "", price: "", offerPrice: "" });
  const [newAddon, setNewAddon] = useState({ name: "", price: "" });
  const [pricingMode, setPricingMode] = useState<'single' | 'variants'>('single');
  const [enableAddons, setEnableAddons] = useState(false);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("adminLoggedIn");
    if (!isLoggedIn) {
      navigate("/admin-login");
    }
  }, [navigate]);

  // Helper function to get the lowest price for display
  const getLowestPrice = (product: Product) => {
    if (product.variants && product.variants.length > 0) {
      const lowestVariantPrice = Math.min(...product.variants.map(v => v.offerPrice));
      return lowestVariantPrice;
    }
    return product.offerPrice;
  };

  // Helper function to get display price for summary
  const getDisplayPrice = () => {
    if (pricingMode === 'single') {
      return formData.offerPrice ? `PKR ${formData.offerPrice}` : 'Not set';
    } else if (variants.length > 0) {
      const lowest = Math.min(...variants.map(v => v.offerPrice));
      return `From PKR ${lowest}`;
    }
    return 'Not set';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Enhanced validation for required fields
    if (!formData.name.trim()) {
      toast.error("Product name is required");
      return;
    }
    
    if (!formData.category) {
      toast.error("Category is required");
      return;
    }
    
    if (!formData.description.trim()) {
      toast.error("Description is required");
      return;
    }
    
    if (!formData.image.trim()) {
      toast.error("Image URL is required");
      return;
    }
    
    // Validation: pricing mode requirements
    if (pricingMode === 'single' && (!formData.price || !formData.offerPrice)) {
      toast.error("Regular Price and Offer Price are required for single pricing");
      return;
    }

    if (pricingMode === 'variants' && variants.length === 0) {
      toast.error("At least one variant is required when using variant pricing");
      return;
    }

    // Validation for fixed stock
    if (formData.stockType === 'fixed' && !formData.unitsInStock) {
      toast.error("Units in stock is required for fixed stock type");
      return;
    }

    const unitsInStock = formData.stockType === 'fixed' ? parseInt(formData.unitsInStock) : undefined;
    const availability = formData.stockType === 'fixed' ? (unitsInStock! > 0) : formData.availability;
    
    const newProduct: Product = {
      id: editingProduct ? editingProduct.id : Date.now(),
      ...formData,
      price: pricingMode === 'single' ? parseFloat(formData.price) : 0,
      offerPrice: pricingMode === 'single' ? parseFloat(formData.offerPrice) : 0,
      availability,
      variants: pricingMode === 'variants' ? variants : [],
      addons: enableAddons ? addons : [],
      unitsInStock
    };

    if (editingProduct) {
      setProducts(products.map(p => p.id === editingProduct.id ? newProduct : p));
      toast.success("Product updated successfully!");
    } else {
      setProducts([...products, newProduct]);
      toast.success("Product added successfully!");
    }

    setShowDialog(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      offerPrice: "",
      category: "",
      availability: true,
      description: "",
      image: "",
      stockType: 'unlimited',
      unitsInStock: ""
    });
    setVariants([]);
    setAddons([]);
    setNewVariant({ name: "", price: "", offerPrice: "" });
    setNewAddon({ name: "", price: "" });
    setEditingProduct(null);
    setPricingMode('single');
    setEnableAddons(false);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      offerPrice: product.offerPrice.toString(),
      category: product.category,
      availability: product.availability,
      description: product.description,
      image: product.image,
      stockType: product.stockType,
      unitsInStock: product.unitsInStock?.toString() || ""
    });
    setVariants(product.variants);
    setAddons(product.addons);
    setPricingMode(product.variants.length > 0 ? 'variants' : 'single');
    setEnableAddons(product.addons.length > 0);
    setShowDialog(true);
  };

  const handleDelete = (id: number) => {
    setProducts(products.filter(p => p.id !== id));
    toast.success("Product deleted successfully!");
  };

  const toggleAvailability = (id: number) => {
    setProducts(products.map(p => {
      if (p.id === id) {
        // For fixed stock, don't allow manual toggle if stock is 0
        if (p.stockType === 'fixed' && p.unitsInStock === 0) {
          toast.error("Cannot mark as available - no units in stock");
          return p;
        }
        return { ...p, availability: !p.availability };
      }
      return p;
    }));
    const product = products.find(p => p.id === id);
    if (product && (product.stockType === 'unlimited' || product.unitsInStock! > 0)) {
      toast.success(`${product?.name} marked as ${!product?.availability ? 'Available' : 'Out of Stock'}`);
    }
  };

  const updateStock = (id: number, newStock: number) => {
    setProducts(products.map(p => {
      if (p.id === id && p.stockType === 'fixed') {
        const availability = newStock > 0;
        return { ...p, unitsInStock: newStock, availability };
      }
      return p;
    }));
    
    const product = products.find(p => p.id === id);
    if (product) {
      if (newStock === 0) {
        toast.info(`${product.name} is now out of stock`);
      } else if (product.unitsInStock === 0 && newStock > 0) {
        toast.success(`${product.name} is now available`);
      }
    }
  };

  const addVariant = () => {
    if (newVariant.name && newVariant.price && newVariant.offerPrice) {
      setVariants([...variants, {
        name: newVariant.name,
        price: parseFloat(newVariant.price),
        offerPrice: parseFloat(newVariant.offerPrice)
      }]);
      setNewVariant({ name: "", price: "", offerPrice: "" });
    }
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const addAddon = () => {
    if (newAddon.name && newAddon.price) {
      setAddons([...addons, {
        name: newAddon.name,
        price: parseFloat(newAddon.price)
      }]);
      setNewAddon({ name: "", price: "" });
    }
  };

  const removeAddon = (index: number) => {
    setAddons(addons.filter((_, i) => i !== index));
  };

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
                      value={formData.category}
                      onValueChange={(value) => setFormData({...formData, category: value})}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
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
                    value={formData.image}
                    onChange={(e) => setFormData({...formData, image: e.target.value})}
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
                            value={formData.unitsInStock}
                            onChange={(e) => setFormData({...formData, unitsInStock: e.target.value})}
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
                          checked={formData.availability}
                          onCheckedChange={(checked) => setFormData({...formData, availability: checked})}
                        />
                        <Label htmlFor="availability">
                          Product Available {formData.availability ? '(In Stock)' : '(Out of Stock)'}
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
                          pricingMode === 'single'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                        onClick={() => setPricingMode('single')}
                      >
                        Single price (no variants)
                      </button>
                      <button
                        type="button"
                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                          pricingMode === 'variants'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                        onClick={() => setPricingMode('variants')}
                      >
                        Has variants
                      </button>
                    </div>
                  </CardContent>
                </Card>

                {/* Base Pricing Card - Show only when single pricing mode */}
                {pricingMode === 'single' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Base Pricing</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="price">Regular Price (PKR) *</Label>
                          <Input
                            id="price"
                            type="number"
                            value={formData.price}
                            onChange={(e) => setFormData({...formData, price: e.target.value})}
                            required
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="offerPrice">Offer Price (PKR) *</Label>
                          <Input
                            id="offerPrice"
                            type="number"
                            value={formData.offerPrice}
                            onChange={(e) => setFormData({...formData, offerPrice: e.target.value})}
                            required
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Variants Table - Show only when variants pricing mode */}
                {pricingMode === 'variants' && (
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
                              value={newVariant.price}
                              onChange={(e) => setNewVariant({...newVariant, price: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label>Offer Price (PKR)</Label>
                            <Input
                              type="number"
                              value={newVariant.offerPrice}
                              onChange={(e) => setNewVariant({...newVariant, offerPrice: e.target.value})}
                            />
                          </div>
                          <Button type="button" onClick={addVariant} style={{ backgroundColor: colors.primary[500] }}>
                            Add
                          </Button>
                        </div>

                        {variants.length > 0 && (
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
                                {variants.map((variant, index) => (
                                  <tr key={index} className="border-t">
                                    <td className="px-4 py-2">{variant.name}</td>
                                    <td className="px-4 py-2">PKR {variant.price}</td>
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
                      checked={enableAddons}
                      onCheckedChange={setEnableAddons}
                    />
                    <Label htmlFor="enableAddons">Enable add-ons</Label>
                  </div>

                  {enableAddons && (
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
                                value={newAddon.price}
                                onChange={(e) => setNewAddon({...newAddon, price: e.target.value})}
                              />
                            </div>
                            <Button type="button" onClick={addAddon} style={{ backgroundColor: colors.primary[500] }}>
                              Add
                            </Button>
                          </div>

                          {addons.length > 0 && (
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
                                  {addons.map((addon, index) => (
                                    <tr key={index} className="border-t">
                                      <td className="px-4 py-2">{addon.name}</td>
                                      <td className="px-4 py-2">PKR {addon.price}</td>
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

                {/* Live Summary Strip */}
                <div className="sticky bottom-0 bg-gray-50 border-t p-4 -mx-6 -mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <div className="text-sm text-gray-600 space-x-4">
                      <span><strong>Stock:</strong> {formData.stockType === 'unlimited' ? 'Unlimited' : `Fixed: ${formData.unitsInStock || 0} left`}</span>
                      <span><strong>Display price:</strong> {getDisplayPrice()}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="ghost" onClick={() => setShowDialog(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" style={{ backgroundColor: colors.primary[500] }} className="hover:opacity-90">
                      {editingProduct ? "Update" : "Add"} Product
                    </Button>
                  </div>
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
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
                <Badge 
                  className={`absolute top-2 right-2 ${
                    product.availability ? 'bg-green-500' : 'bg-red-500'
                  }`}
                >
                  {product.availability ? 'Available' : 'Out of Stock'}
                </Badge>
              </div>
              
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                <Badge variant="secondary" className="mb-2">{product.category}</Badge>
                
                {/* Stock Display */}
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Stock:</span>
                  <span className="text-sm font-medium">
                    {product.stockType === 'unlimited' ? '∞' : `${product.unitsInStock || 0} units`}
                  </span>
                </div>

                {/* Stock Management for Fixed Stock */}
                {product.stockType === 'fixed' && (
                  <div className="flex items-center gap-2 mb-3">
                    <Input
                      type="number"
                      min="0"
                      value={product.unitsInStock || 0}
                      onChange={(e) => updateStock(product.id, parseInt(e.target.value) || 0)}
                      className="w-20 h-8 text-sm"
                    />
                    <Label className="text-xs text-gray-500">units</Label>
                  </div>
                )}
                
                <div className="flex justify-between items-center mb-4">
                  <div>
                    {product.variants && product.variants.length > 0 ? (
                      <span className="text-lg font-bold" style={{ color: colors.primary[500] }}>
                        From PKR {getLowestPrice(product)}
                      </span>
                    ) : (
                      <>
                        <span className="text-lg font-bold" style={{ color: colors.primary[500] }}>
                          PKR {product.offerPrice}
                        </span>
                        {product.price !== product.offerPrice && (
                          <span className="text-sm text-gray-500 line-through ml-2">
                            PKR {product.price}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {product.variants.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-600 mb-1">Variants:</p>
                    <div className="flex flex-wrap gap-1">
                      {product.variants.map((variant, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {variant.name} - PKR {variant.offerPrice}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {product.addons.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-600 mb-1">Add-ons:</p>
                    <div className="flex flex-wrap gap-1">
                      {product.addons.slice(0, 2).map((addon, index) => (
                        <Badge key={index} variant="outline" className="text-xs bg-green-50">
                          +{addon.name} (+PKR {addon.price})
                        </Badge>
                      ))}
                      {product.addons.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{product.addons.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="flex space-x-2 mb-2">
                  <Button
                    size="sm"
                    variant={product.availability ? "outline" : "default"}
                    onClick={() => toggleAvailability(product.id)}
                    className="flex-1"
                    style={!product.availability ? { backgroundColor: colors.status.success } : {}}
                    disabled={product.stockType === 'fixed' && product.unitsInStock === 0 && !product.availability}
                  >
                    {product.availability ? 'Mark Out of Stock' : 'Mark Available'}
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
