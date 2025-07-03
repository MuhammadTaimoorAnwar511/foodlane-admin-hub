
import { useState, useEffect } from "react";
import { Plus, Trash2, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface DealItem {
  id: string;
  product: string;
  quantity: number;
  variant?: string;
  price: number;
}

interface DealAddon {
  id: string;
  name: string;
  price: number;
}

interface Deal {
  id?: string;
  name: string;
  category: string;
  image?: string;
  status: "active" | "draft";
  startDate?: Date;
  endDate?: Date;
  startTime?: string;
  endTime?: string;
  items: { product: string; quantity: number; variant?: string }[];
  price: number;
  offerPrice?: number;
  pricingMode: "fixed" | "calculated";
  discountPercent?: number;
  enableAddons: boolean;
  addons: DealAddon[];
  countStock: boolean;
}

interface DealModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deal?: Deal | null;
  onSave: (deal: Deal) => void;
}

const mockProducts = [
  { id: "1", name: "Zinger Burger", price: 450, variants: ["Regular", "Spicy"] },
  { id: "2", name: "Chicken Burger", price: 350, variants: [] },
  { id: "3", name: "Fries", price: 150, variants: ["Small", "Medium", "Large"] },
  { id: "4", name: "Drink", price: 120, variants: ["345ml", "500ml", "1.5L"] },
  { id: "5", name: "Chicken Pieces", price: 800, variants: ["4 pcs", "6 pcs", "8 pcs"] },
];

const mockCategories = ["Combos", "Family Deals", "Student Deals", "Beverages", "Desserts"];

const DealModal = ({ open, onOpenChange, deal, onSave }: DealModalProps) => {
  const [formData, setFormData] = useState<Deal>({
    name: "",
    category: "",
    status: "active",
    items: [],
    price: 0,
    pricingMode: "fixed",
    enableAddons: false,
    addons: [],
    countStock: true,
  });

  const [dealItems, setDealItems] = useState<DealItem[]>([]);
  const [showAddItemDialog, setShowAddItemDialog] = useState(false);
  const [newItem, setNewItem] = useState({
    product: "",
    quantity: 1,
    variant: "",
  });

  useEffect(() => {
    if (deal) {
      setFormData(deal);
      // Convert items to DealItem format
      const convertedItems: DealItem[] = deal.items.map((item, index) => ({
        id: `${index}`,
        product: item.product,
        quantity: item.quantity,
        variant: item.variant || "",
        price: mockProducts.find(p => p.name === item.product)?.price || 0,
      }));
      setDealItems(convertedItems);
    } else {
      setFormData({
        name: "",
        category: "",
        status: "active",
        items: [],
        price: 0,
        pricingMode: "fixed",
        enableAddons: false,
        addons: [],
        countStock: true,
      });
      setDealItems([]);
    }
  }, [deal, open]);

  const calculateSubtotal = () => {
    return dealItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateDisplayPrice = () => {
    if (formData.pricingMode === "fixed") {
      return formData.offerPrice || formData.price;
    } else {
      const subtotal = calculateSubtotal();
      const discount = (formData.discountPercent || 0) / 100;
      return Math.round(subtotal * (1 - discount));
    }
  };

  const handleAddItem = () => {
    if (!newItem.product) {
      toast.error("Please select a product");
      return;
    }

    const product = mockProducts.find(p => p.name === newItem.product);
    if (!product) return;

    const item: DealItem = {
      id: `${Date.now()}`,
      product: newItem.product,
      quantity: newItem.quantity,
      variant: newItem.variant || undefined,
      price: product.price,
    };

    setDealItems(prev => [...prev, item]);
    setNewItem({ product: "", quantity: 1, variant: "" });
    setShowAddItemDialog(false);
  };

  const handleRemoveItem = (itemId: string) => {
    setDealItems(prev => prev.filter(item => item.id !== itemId));
  };

  const handleAddAddon = () => {
    const newAddon: DealAddon = {
      id: `${Date.now()}`,
      name: "",
      price: 0,
    };
    setFormData(prev => ({
      ...prev,
      addons: [...prev.addons, newAddon],
    }));
  };

  const handleRemoveAddon = (addonId: string) => {
    setFormData(prev => ({
      ...prev,
      addons: prev.addons.filter(addon => addon.id !== addonId),
    }));
  };

  const handleUpdateAddon = (addonId: string, field: keyof DealAddon, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      addons: prev.addons.map(addon =>
        addon.id === addonId ? { ...addon, [field]: value } : addon
      ),
    }));
  };

  const handleSave = () => {
    if (!formData.name || !formData.category || dealItems.length === 0) {
      toast.error("Please fill in all required fields and add at least one item");
      return;
    }

    const dealData: Deal = {
      ...formData,
      items: dealItems.map(item => ({
        product: item.product,
        quantity: item.quantity,
        variant: item.variant,
      })),
      price: formData.pricingMode === "calculated" ? calculateDisplayPrice() : formData.price,
    };

    onSave(dealData);
  };

  const selectedProduct = mockProducts.find(p => p.name === newItem.product);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {deal ? "Edit Deal" : "Add New Deal"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Deal Basics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Deal Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Zinger Combo Deal"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockCategories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="status"
                  checked={formData.status === "active"}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, status: checked ? "active" : "draft" }))
                  }
                />
                <Label htmlFor="status">Active</Label>
                <Badge variant={formData.status === "active" ? "default" : "secondary"}>
                  {formData.status === "active" ? "Active" : "Draft"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Deal Items */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Deal Contents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Variant</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dealItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.product}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => {
                              const newQuantity = parseInt(e.target.value) || 1;
                              setDealItems(prev => prev.map(i => 
                                i.id === item.id ? { ...i, quantity: newQuantity } : i
                              ));
                            }}
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>{item.variant || "—"}</TableCell>
                        <TableCell>PKR {item.price}</TableCell>
                        <TableCell>PKR {item.price * item.quantity}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {dealItems.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                          No items added yet. Click "Add Item" to get started.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>

                <Button onClick={() => setShowAddItemDialog(true)} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="fixed-price"
                    name="pricing-mode"
                    checked={formData.pricingMode === "fixed"}
                    onChange={() => setFormData(prev => ({ ...prev, pricingMode: "fixed" }))}
                  />
                  <Label htmlFor="fixed-price">Fixed deal price</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="calculated-price"
                    name="pricing-mode"
                    checked={formData.pricingMode === "calculated"}
                    onChange={() => setFormData(prev => ({ ...prev, pricingMode: "calculated" }))}
                  />
                  <Label htmlFor="calculated-price">Calculated (sum of items − discount)</Label>
                </div>
              </div>

              {formData.pricingMode === "fixed" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Regular Price *</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="offerPrice">Offer Price (Optional)</Label>
                    <Input
                      id="offerPrice"
                      type="number"
                      value={formData.offerPrice || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, offerPrice: parseFloat(e.target.value) || undefined }))}
                      placeholder="0"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="discount">Discount %</Label>
                    <Input
                      id="discount"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.discountPercent || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, discountPercent: parseFloat(e.target.value) || 0 }))}
                      placeholder="0"
                    />
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm space-y-1">
                      <div>Subtotal: PKR {calculateSubtotal()}</div>
                      <div>Discount: {formData.discountPercent || 0}%</div>
                      <div className="font-semibold">Display Price: PKR {calculateDisplayPrice()}</div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Add-ons */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Add-ons</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="enable-addons"
                    checked={formData.enableAddons}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enableAddons: checked === true }))}
                  />
                  <Label htmlFor="enable-addons">Enable add-ons</Label>
                </div>

                {formData.enableAddons && (
                  <div className="space-y-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Add-on Name</TableHead>
                          <TableHead>Additional Price</TableHead>
                          <TableHead className="w-12"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {formData.addons.map((addon) => (
                          <TableRow key={addon.id}>
                            <TableCell>
                              <Input
                                value={addon.name}
                                onChange={(e) => handleUpdateAddon(addon.id, "name", e.target.value)}
                                placeholder="Add-on name"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                value={addon.price}
                                onChange={(e) => handleUpdateAddon(addon.id, "price", parseFloat(e.target.value) || 0)}
                                placeholder="0"
                              />
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveAddon(addon.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <Button onClick={handleAddAddon} variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Add-on
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Stock Behavior */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Stock Behavior</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="count-stock"
                  checked={formData.countStock}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, countStock: checked === true }))}
                />
                <Label htmlFor="count-stock">Count deal sales against individual item stock</Label>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                When enabled, selling this deal will reduce the stock count of individual items included in the deal.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Summary Footer */}
        <div className="sticky bottom-0 bg-white border-t pt-4 mt-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="text-sm text-gray-600">
              <span className="font-medium">Items:</span> {dealItems.length} • 
              <span className="font-medium"> Price:</span> PKR {calculateDisplayPrice()}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} className="bg-orange-500 hover:bg-orange-600">
                {deal ? "Update Deal" : "Save Deal"}
              </Button>
            </div>
          </div>
        </div>

        {/* Add Item Dialog */}
        <Dialog open={showAddItemDialog} onOpenChange={setShowAddItemDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Item to Deal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Product *</Label>
                <Select value={newItem.product} onValueChange={(value) => setNewItem(prev => ({ ...prev, product: value, variant: "" }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockProducts.map(product => (
                      <SelectItem key={product.id} value={product.name}>
                        {product.name} - PKR {product.price}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedProduct && selectedProduct.variants.length > 0 && (
                <div className="space-y-2">
                  <Label>Variant</Label>
                  <Select value={newItem.variant} onValueChange={(value) => setNewItem(prev => ({ ...prev, variant: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select variant" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedProduct.variants.map(variant => (
                        <SelectItem key={variant} value={variant}>
                          {variant}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input
                  type="number"
                  min="1"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowAddItemDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddItem}>
                Add Item
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
};

export default DealModal;
