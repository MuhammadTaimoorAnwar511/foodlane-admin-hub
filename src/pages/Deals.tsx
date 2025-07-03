
import { useState } from "react";
import { Plus, Search, Edit, Copy, Trash2 } from "lucide-react";
import AdminSidebar from "@/components/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import colors from "@/theme/colors";
import DealModal from "@/components/DealModal";

interface Deal {
  id: string;
  name: string;
  price: number;
  offerPrice?: number;
  items: { product: string; quantity: number; variant?: string }[];
  status: "active" | "draft" | "ended";
  category: string;
  image?: string;
  startDate?: Date;
  endDate?: Date;
  startTime?: string;
  endTime?: string;
  pricingMode: "fixed" | "calculated";
  discountPercent?: number;
  enableAddons: boolean;
  addons: { id: string; name: string; price: number }[];
  countStock: boolean;
  limitedCustomers: boolean;
  customerLimit?: number;
}

// Mock data for categories (this should come from your category management)
const mockCategories = ["Combos", "Family Deals", "Student Deals", "Beverages", "Desserts"];

// Mock data for products (this should come from your product management)
const mockProducts = [
  { id: "1", name: "Zinger Burger", price: 450, variants: ["Regular", "Spicy"] },
  { id: "2", name: "Chicken Burger", price: 350, variants: [] },
  { id: "3", name: "Fries", price: 150, variants: ["Small", "Medium", "Large"] },
  { id: "4", name: "Drink", price: 120, variants: ["345ml", "500ml", "1.5L"] },
  { id: "5", name: "Chicken Pieces", price: 800, variants: ["4 pcs", "6 pcs", "8 pcs"] },
];

const mockDeals: Deal[] = [
  {
    id: "1",
    name: "Zinger Combo Deal",
    price: 749,
    offerPrice: 649,
    items: [
      { product: "Zinger Burger", quantity: 1 },
      { product: "Fries", quantity: 1 },
      { product: "345ml Drink", quantity: 1 }
    ],
    status: "active",
    category: "Combos",
    pricingMode: "fixed",
    enableAddons: false,
    addons: [],
    countStock: true,
    limitedCustomers: false
  },
  {
    id: "2",
    name: "Family Feast",
    price: 1999,
    items: [
      { product: "Chicken Pieces", quantity: 8 },
      { product: "Large Fries", quantity: 2 },
      { product: "1.5L Drink", quantity: 1 }
    ],
    status: "active",
    category: "Family Deals",
    pricingMode: "fixed",
    enableAddons: true,
    addons: [
      { id: "1", name: "Extra Sauce", price: 50 }
    ],
    countStock: true,
    limitedCustomers: true,
    customerLimit: 100
  },
  {
    id: "3",
    name: "Student Special",
    price: 399,
    items: [
      { product: "Burger", quantity: 1 },
      { product: "Small Fries", quantity: 1 }
    ],
    status: "draft",
    category: "Student Deals",
    pricingMode: "calculated",
    discountPercent: 15,
    enableAddons: false,
    addons: [],
    countStock: true,
    limitedCustomers: false
  }
];

const Deals = () => {
  const [deals, setDeals] = useState<Deal[]>(mockDeals);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDeals, setSelectedDeals] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [dealToDelete, setDealToDelete] = useState<string | null>(null);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);

  const categories = ["all", ...mockCategories];

  const filteredDeals = deals.filter(deal => {
    const matchesSearch = deal.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || deal.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddDeal = () => {
    setEditingDeal(null);
    setIsModalOpen(true);
  };

  const handleEditDeal = (deal: Deal) => {
    setEditingDeal(deal);
    setIsModalOpen(true);
  };

  const handleDuplicateDeal = (deal: Deal) => {
    const duplicatedDeal = {
      ...deal,
      id: `${Date.now()}`,
      name: `${deal.name} (Copy)`,
      status: "draft" as const
    };
    setEditingDeal(duplicatedDeal);
    setIsModalOpen(true);
  };

  const handleDeleteDeal = (dealId: string) => {
    setDealToDelete(dealId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (dealToDelete) {
      setDeals(prev => prev.filter(deal => deal.id !== dealToDelete));
      toast.success("Deal deleted successfully");
    }
    setDeleteDialogOpen(false);
    setDealToDelete(null);
  };

  const handleBulkDelete = () => {
    setBulkDeleteDialogOpen(true);
  };

  const confirmBulkDelete = () => {
    setDeals(prev => prev.filter(deal => !selectedDeals.includes(deal.id)));
    toast.success(`${selectedDeals.length} deals deleted successfully`);
    setSelectedDeals([]);
    setBulkDeleteDialogOpen(false);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedDeals(filteredDeals.map(deal => deal.id));
    } else {
      setSelectedDeals([]);
    }
  };

  const handleSelectDeal = (dealId: string, checked: boolean) => {
    if (checked) {
      setSelectedDeals(prev => [...prev, dealId]);
    } else {
      setSelectedDeals(prev => prev.filter(id => id !== dealId));
    }
  };

  const getStatusBadge = (status: Deal['status']) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>;
      case 'ended':
        return <Badge variant="destructive">Ended</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getPriceDisplay = (deal: Deal) => {
    if (deal.offerPrice) {
      return (
        <div className="flex flex-col">
          <span className="text-sm line-through text-gray-500">PKR {deal.price}</span>
          <span className="font-semibold">PKR {deal.offerPrice}</span>
        </div>
      );
    }
    return <span className="font-semibold">PKR {deal.price}</span>;
  };

  const getItemsList = (items: Deal['items']) => {
    return (
      <div className="flex flex-wrap gap-1">
        {items.map((item, index) => (
          <Badge key={index} variant="outline" className="text-xs">
            {item.product} ✕ {item.quantity}
          </Badge>
        ))}
      </div>
    );
  };

  const getCustomerLimitDisplay = (deal: Deal) => {
    if (deal.limitedCustomers && deal.customerLimit) {
      return (
        <div className="text-xs text-gray-500">
          Limited to first {deal.customerLimit} customers
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      
      <div className="flex-1 p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Deals Management</h1>
              <p className="text-gray-600 mt-1">Create and manage combo deals</p>
            </div>
            <Button 
              onClick={handleAddDeal}
              className="bg-orange-500 hover:bg-orange-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Deal
            </Button>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search deals..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category === "all" ? "All Categories" : category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedDeals.length > 0 && (
                  <Button 
                    variant="destructive" 
                    onClick={handleBulkDelete}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete ({selectedDeals.length})
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Deals Table */}
          <Card>
            <CardHeader>
              <CardTitle>Deals ({filteredDeals.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedDeals.length === filteredDeals.length && filteredDeals.length > 0}
                        onCheckedChange={(checked) => handleSelectAll(checked === true)}
                      />
                    </TableHead>
                    <TableHead>Deal Name</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Included Items</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Customer Limit</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDeals.map((deal) => (
                    <TableRow key={deal.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedDeals.includes(deal.id)}
                          onCheckedChange={(checked) => handleSelectDeal(deal.id, checked === true)}
                        />
                      </TableCell>
                      <TableCell>
                        <button
                          onClick={() => handleEditDeal(deal)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          {deal.name}
                        </button>
                      </TableCell>
                      <TableCell>
                        <div>
                          {getPriceDisplay(deal)}
                          {deal.enableAddons && deal.addons.length > 0 && (
                            <div className="text-xs text-gray-500 mt-1">
                              + Add-ons available
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getItemsList(deal.items)}</TableCell>
                      <TableCell>{getStatusBadge(deal.status)}</TableCell>
                      <TableCell>
                        {getCustomerLimitDisplay(deal)}
                        {!deal.limitedCustomers && (
                          <span className="text-xs text-gray-500">Unlimited</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditDeal(deal)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDuplicateDeal(deal)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteDeal(deal.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredDeals.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        No deals found. Create your first deal to get started.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Deal Modal */}
      <DealModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        deal={editingDeal}
        categories={mockCategories}
        products={mockProducts}
        onSave={(dealData) => {
          if (editingDeal && editingDeal.id) {
            // Update existing deal
            setDeals(prev => prev.map(deal => 
              deal.id === editingDeal.id ? { ...dealData, id: editingDeal.id } : deal
            ));
            toast.success("Deal updated successfully");
          } else {
            // Add new deal
            const newDeal = { ...dealData, id: `${Date.now()}` };
            setDeals(prev => [...prev, newDeal]);
            toast.success("Deal created successfully");
          }
          setIsModalOpen(false);
        }}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Deal</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this deal? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Selected Deals</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedDeals.length} selected deals? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmBulkDelete}>
              Delete All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Deals;
