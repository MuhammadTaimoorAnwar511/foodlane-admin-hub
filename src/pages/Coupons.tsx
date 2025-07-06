
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
import CouponModal from "@/components/CouponModal";
import { useCoupons, useCreateCoupon, useUpdateCoupon, useDeleteCoupon, Coupon } from "@/hooks/useCoupons";

const Coupons = () => {
  const { data: coupons = [], isLoading, error } = useCoupons();
  const createCouponMutation = useCreateCoupon();
  const updateCouponMutation = useUpdateCoupon();
  const deleteCouponMutation = useDeleteCoupon();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedCoupons, setSelectedCoupons] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState<string | null>(null);

  const statusOptions = ["all", "active", "inactive", "expired"];

  const filteredCoupons = coupons.filter(coupon => {
    const matchesSearch = coupon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         coupon.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "all" || coupon.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  if (error) {
    console.error("Error loading coupons:", error);
    toast.error("Failed to load coupons");
  }

  const handleAddCoupon = () => {
    setEditingCoupon(null);
    setIsModalOpen(true);
  };

  const handleEditCoupon = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setIsModalOpen(true);
  };

  const handleDuplicateCoupon = (coupon: Coupon) => {
    const duplicatedCoupon = {
      ...coupon,
      code: `${coupon.code}-COPY`,
      name: `${coupon.name} (Copy)`,
      status: "inactive" as const
    };
    delete (duplicatedCoupon as any).id;
    delete (duplicatedCoupon as any).created_at;
    delete (duplicatedCoupon as any).updated_at;
    setEditingCoupon(duplicatedCoupon);
    setIsModalOpen(true);
  };

  const handleDeleteCoupon = (couponId: string) => {
    setCouponToDelete(couponId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (couponToDelete) {
      deleteCouponMutation.mutate(couponToDelete);
    }
    setDeleteDialogOpen(false);
    setCouponToDelete(null);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCoupons(filteredCoupons.map(coupon => coupon.id));
    } else {
      setSelectedCoupons([]);
    }
  };

  const handleSelectCoupon = (couponId: string, checked: boolean) => {
    if (checked) {
      setSelectedCoupons(prev => [...prev, couponId]);
    } else {
      setSelectedCoupons(prev => prev.filter(id => id !== couponId));
    }
  };

  const getStatusBadge = (status: Coupon['status']) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>;
      case 'expired':
        return <Badge variant="destructive">Expired</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getDiscountDisplay = (coupon: Coupon) => {
    switch (coupon.discount_type) {
      case 'percentage':
        return `${coupon.discount_value}% off`;
      case 'fixed_amount':
        return `PKR ${coupon.discount_value} off`;
      default:
        return 'Unknown';
    }
  };

  const handleSaveCoupon = (couponData: Coupon) => {
    if (editingCoupon && editingCoupon.id) {
      // Update existing coupon
      updateCouponMutation.mutate({ ...couponData, id: editingCoupon.id });
    } else {
      // Create new coupon
      const { id, created_at, updated_at, ...createData } = couponData;
      createCouponMutation.mutate(createData);
    }
    setIsModalOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />
        <div className="flex-1 p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-8">Loading coupons...</div>
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
              <h1 className="text-2xl font-bold text-gray-900">Coupon Management</h1>
              <p className="text-gray-600 mt-1">Create and manage discount coupons</p>
            </div>
            <Button 
              onClick={handleAddCoupon}
              className="bg-orange-500 hover:bg-orange-600"
              disabled={createCouponMutation.isPending}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Coupon
            </Button>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search coupons..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(status => (
                      <SelectItem key={status} value={status}>
                        {status === "all" ? "All Status" : status.charAt(0).toUpperCase() + status.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Coupons Table */}
          <Card>
            <CardHeader>
              <CardTitle>Coupons ({filteredCoupons.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedCoupons.length === filteredCoupons.length && filteredCoupons.length > 0}
                        onCheckedChange={(checked) => handleSelectAll(checked === true)}
                      />
                    </TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCoupons.map((coupon) => (
                    <TableRow key={coupon.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedCoupons.includes(coupon.id)}
                          onCheckedChange={(checked) => handleSelectCoupon(coupon.id, checked === true)}
                        />
                      </TableCell>
                      <TableCell>
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                          {coupon.code}
                        </code>
                      </TableCell>
                      <TableCell>
                        <button
                          onClick={() => handleEditCoupon(coupon)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          {coupon.name}
                        </button>
                      </TableCell>
                      <TableCell>{getDiscountDisplay(coupon)}</TableCell>
                      <TableCell>
                        {coupon.used_count}
                        {coupon.usage_limit && ` / ${coupon.usage_limit}`}
                      </TableCell>
                      <TableCell>{getStatusBadge(coupon.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditCoupon(coupon)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDuplicateCoupon(coupon)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCoupon(coupon.id)}
                            disabled={deleteCouponMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredCoupons.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        No coupons found. Create your first coupon to get started.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Coupon Modal */}
      <CouponModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        coupon={editingCoupon}
        onSave={handleSaveCoupon}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Coupon</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this coupon? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              disabled={deleteCouponMutation.isPending}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Coupons;
