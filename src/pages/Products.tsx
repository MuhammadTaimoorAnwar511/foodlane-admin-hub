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
      image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop"
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
      image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop"
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
    image: ""
  });
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [addons, setAddons] = useState<ProductAddon[]>([]);
  const [newVariant, setNewVariant] = useState({ name: "", price: "", offerPrice: "" });
  const [newAddon, setNewAddon] = useState({ name: "", price: "" });

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

  // Helper function to check if product has variants or addons
  const hasVariantsOrAddons = variants.length > 0 || addons.length > 0;

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
    
    // Validation: If no variants, require base pricing
    if (variants.length === 0 && (!formData.price || !formData.offerPrice)) {
      toast.error("Regular Price and Offer Price are required when no variants are specified");
      return;
    }
    
    const newProduct: Product = {
      id: editingProduct ? editingProduct.id : Date.now(),
      ...formData,
      price: variants.length > 0 ? 0 : parseFloat(formData.price),
      offerPrice: variants.length > 0 ? 0 : parseFloat(formData.offerPrice),
      variants,
      addons
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
      image: ""
    });
    setVariants([]);
    setAddons([]);
    setNewVariant({ name: "", price: "", offerPrice: "" });
    setNewAddon({ name: "", price: "" });
    setEditingProduct(null);
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
      image: product.image
    });
    setVariants(product.variants);
    setAddons(product.addons);
    setShowDialog(true);
  };

  const handleDelete = (id: number) => {
    setProducts(products.filter(p => p.id !== id));
    toast.success("Product deleted successfully!");
  };

  const toggleAvailability = (id: number) => {
    setProducts(products.map(p => 
      p.id === id ? { ...p, availability: !p.availability } : p
    ));
    const product = products.find(p => p.id === id);
    toast.success(`${product?.name} marked as ${!product?.availability ? 'Available' : 'Out of Stock'}`);
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

                {/* Availability Toggle */}
                <div className="flex items-center space-x-2">
                  <Switch
                    id="availability"
                    checked={formData.availability}
                    onCheckedChange={(checked) => setFormData({...formData, availability: checked})}
                  />
                  <Label htmlFor="availability">
                    Product Available {formData.availability ? '(In Stock)' : '(Out of Stock)'}
                  </Label>
                </div>

                {/* Base Pricing - Only show when no variants exist */}
                {variants.length === 0 && (
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">Base Pricing</h4>
                      <p className="text-sm text-blue-700">
                        Since no variants are added, base pricing is required. This will be the price displayed for this product.
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="price">Regular Price (PKR) *</Label>
                        <Input
                          id="price"
                          type="number"
                          value={formData.price}
                          onChange={(e) => setFormData({...formData, price: e.target.value})}
                          required={variants.length === 0}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="offerPrice">Offer Price (PKR) *</Label>
                        <Input
                          id="offerPrice"
                          type="number"
                          value={formData.offerPrice}
                          onChange={(e) => setFormData({...formData, offerPrice: e.target.value})}
                          required={variants.length === 0}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Pricing Note when variants exist */}
                {variants.length > 0 && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <h4 className="font-semibold text-amber-800 mb-2">💡 Variant-Based Pricing Active</h4>
                    <p className="text-sm text-amber-700">
                      Since you have variants, pricing will be managed through those options. The lowest variant price will be displayed as "From PKR X" on product cards.
                    </p>
                  </div>
                )}

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

                {/* Variants Section */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-lg font-semibold">Product Variants</Label>
                    <p className="text-sm text-gray-600">Add different sizes or variations with their specific pricing</p>
                  </div>
                  
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
                    <Button type="button" onClick={addVariant}>Add</Button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {variants.map((variant, index) => (
                      <Badge key={index} variant="outline" className="flex items-center gap-2">
                        {variant.name} - PKR {variant.offerPrice}
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => removeVariant(index)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Add-ons Section */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-lg font-semibold">Product Add-ons</Label>
                    <p className="text-sm text-gray-600">Add optional extras customers can choose</p>
                  </div>
                  
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
                    <Button type="button" onClick={addAddon}>Add</Button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {addons.map((addon, index) => (
                      <Badge key={index} variant="outline" className="flex items-center gap-2 bg-green-50">
                        {addon.name} (+PKR {addon.price})
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => removeAddon(index)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" style={{ backgroundColor: colors.primary[500] }} className="hover:opacity-90">
                    {editingProduct ? "Update" : "Add"} Product
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
