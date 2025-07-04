
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
import { useDeals, useCreateDeal, useUpdateDeal, useDeleteDeal, useBulkDeleteDeals, Deal } from "@/hooks/useDeals";
import { useCategories } from "@/hooks/useCategories";

const Deals = () => {
  const { data: deals = [], isLoading, error } = useDeals();
  const { data: categories = [] } = useCategories();
  const createDealMutation = useCreateDeal();
  const updateDealMutation = useUpdateDeal();
  const deleteDealMutation = useDeleteDeal();
  const bulkDeleteMutation = useBulkDeleteDeals();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDeals, setSelectedDeals] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [dealToDelete, setDealToDelete] = useState<string | null>(null);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);

  // Get unique categories from deals and add database categories
  const dealCategories = ["all", ...new Set(deals.map(deal => deal.category))];
  const allCategories = [...new Set([...dealCategories, ...categories.map(cat => cat.name)])];

  const filteredDeals = deals.filter(deal => {
    const matchesSearch = deal.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || deal.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (error) {
    console.error("Error loading deals:", error);
    toast.error("Failed to load deals");
  }

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
      name: `${deal.name} (Copy)`,
      status: "draft" as const
    };
    delete (duplicatedDeal as any).id;
    delete (duplicatedDeal as any).created_at;
    delete (duplicatedDeal as any).updated_at;
    setEditingDeal(duplicatedDeal);
    setIsModalOpen(true);
  };

  const handleDeleteDeal = (dealId: string) => {
    setDealToDelete(dealId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (dealToDelete) {
      deleteDealMutation.mutate(dealToDelete);
    }
    setDeleteDialogOpen(false);
    setDealToDelete(null);
  };

  const handleBulkDelete = () => {
    setBulkDeleteDialogOpen(true);
  };

  const confirmBulkDelete = () => {
    bulkDeleteMutation.mutate(selectedDeals);
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
    if (deal.offer_price) {
      return (
        <div className="flex flex-col">
          <span className="text-sm line-through text-gray-500">PKR {deal.price}</span>
          <span className="font-semibold">PKR {deal.offer_price}</span>
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

  const handleSaveDeal = (dealData: Deal) => {
    if (editingDeal && editingDeal.id) {
      // Update existing deal
      updateDealMutation.mutate({ ...dealData, id: editingDeal.id });
    } else {
      // Create new deal
      const { id, created_at, updated_at, ...createData } = dealData;
      createDealMutation.mutate(createData);
    }
    setIsModalOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />
        <div className="flex-1 p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-8">Loading deals...</div>
          </div>
        </div>
      </div>
    );
  }

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
              disabled={createDealMutation.isPending}
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
                    {allCategories.map(category => (
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
                    disabled={bulkDeleteMutation.isPending}
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
                      <TableCell>{getPriceDisplay(deal)}</TableCell>
                      <TableCell>{getItemsList(deal.items)}</TableCell>
                      <TableCell>{getStatusBadge(deal.status)}</TableCell>
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
                            disabled={deleteDealMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredDeals.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
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
        onSave={handleSaveDeal}
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
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              disabled={deleteDealMutation.isPending}
            >
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
            <Button 
              variant="destructive" 
              onClick={confirmBulkDelete}
              disabled={bulkDeleteMutation.isPending}
            >
              Delete All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Deals;
