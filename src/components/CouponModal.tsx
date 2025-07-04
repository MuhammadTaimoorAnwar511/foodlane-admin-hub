
import { useState, useEffect } from "react";
import { Calendar, Clock, Percent, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Coupon } from "@/hooks/useCoupons";

interface CouponModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coupon?: Coupon | null;
  onSave: (coupon: Coupon) => void;
}

const CouponModal = ({ open, onOpenChange, coupon, onSave }: CouponModalProps) => {
  const [formData, setFormData] = useState<Coupon>({
    id: "",
    code: "",
    name: "",
    discount_type: "percentage",
    discount_value: 0,
    used_count: 0,
    status: "active",
    is_first_order_only: false,
  });

  const [hasExpiry, setHasExpiry] = useState(false);
  const [hasUsageLimit, setHasUsageLimit] = useState(false);
  const [hasMinOrder, setHasMinOrder] = useState(false);

  useEffect(() => {
    if (coupon) {
      setFormData(coupon);
      setHasExpiry(!!coupon.end_date);
      setHasUsageLimit(!!coupon.usage_limit);
      setHasMinOrder(!!coupon.min_order_amount);
    } else {
      setFormData({
        id: "",
        code: "",
        name: "",
        discount_type: "percentage",
        discount_value: 0,
        used_count: 0,
        status: "active",
        is_first_order_only: false,
      });
      setHasExpiry(false);
      setHasUsageLimit(false);
      setHasMinOrder(false);
    }
  }, [coupon, open]);

  const generateCouponCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, code: result }));
  };

  const handleSave = () => {
    if (!formData.code || !formData.name || !formData.discount_value) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.discount_type === "percentage" && formData.discount_value > 100) {
      toast.error("Percentage discount cannot exceed 100%");
      return;
    }

    const couponData: Coupon = {
      ...formData,
      min_order_amount: hasMinOrder ? formData.min_order_amount : undefined,
      usage_limit: hasUsageLimit ? formData.usage_limit : undefined,
      end_date: hasExpiry ? formData.end_date : undefined,
    };

    onSave(couponData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {coupon ? "Edit Coupon" : "Create New Coupon"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Coupon Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., 20% Off Deal"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">Coupon Code *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                      placeholder="SAVE20"
                      className="font-mono"
                    />
                    <Button type="button" variant="outline" onClick={generateCouponCode}>
                      Generate
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="status"
                  checked={formData.status === "active"}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, status: checked ? "active" : "inactive" }))
                  }
                />
                <Label htmlFor="status">Active</Label>
                <Badge variant={formData.status === "active" ? "default" : "secondary"}>
                  {formData.status === "active" ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Discount Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Discount Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Discount Type</Label>
                <Select 
                  value={formData.discount_type} 
                  onValueChange={(value: "percentage" | "fixed_amount" | "free_delivery") => 
                    setFormData(prev => ({ ...prev, discount_type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">
                      <div className="flex items-center gap-2">
                        <Percent className="h-4 w-4" />
                        Percentage (%)
                      </div>
                    </SelectItem>
                    <SelectItem value="fixed_amount">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Fixed Amount (PKR)
                      </div>
                    </SelectItem>
                    <SelectItem value="free_delivery">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Free Delivery
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="discount_value">
                  Discount Value * 
                  {formData.discount_type === "percentage" ? " (%)" : formData.discount_type === "fixed_amount" ? " (PKR)" : ""}
                </Label>
                <Input
                  id="discount_value"
                  type="number"
                  min="0"
                  max={formData.discount_type === "percentage" ? "100" : undefined}
                  value={formData.discount_value}
                  onChange={(e) => setFormData(prev => ({ ...prev, discount_value: parseFloat(e.target.value) || 0 }))}
                  placeholder={formData.discount_type === "percentage" ? "20" : "100"}
                  disabled={formData.discount_type === "free_delivery"}
                />
              </div>
            </CardContent>
          </Card>

          {/* Conditions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Conditions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="hasMinOrder"
                  checked={hasMinOrder}
                  onCheckedChange={setHasMinOrder}
                />
                <Label htmlFor="hasMinOrder">Minimum order amount</Label>
              </div>
              {hasMinOrder && (
                <div className="ml-6 space-y-2">
                  <Label htmlFor="min_order_amount">Minimum Order Amount (PKR)</Label>
                  <Input
                    id="min_order_amount"
                    type="number"
                    min="0"
                    value={formData.min_order_amount || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, min_order_amount: parseFloat(e.target.value) || undefined }))}
                    placeholder="500"
                  />
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Switch
                  id="hasUsageLimit"
                  checked={hasUsageLimit}
                  onCheckedChange={setHasUsageLimit}
                />
                <Label htmlFor="hasUsageLimit">Usage limit</Label>
              </div>
              {hasUsageLimit && (
                <div className="ml-6 space-y-2">
                  <Label htmlFor="usage_limit">Maximum Uses</Label>
                  <Input
                    id="usage_limit"
                    type="number"
                    min="1"
                    value={formData.usage_limit || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, usage_limit: parseInt(e.target.value) || undefined }))}
                    placeholder="100"
                  />
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Switch
                  id="hasExpiry"
                  checked={hasExpiry}
                  onCheckedChange={setHasExpiry}
                />
                <Label htmlFor="hasExpiry">Expiration date</Label>
              </div>
              {hasExpiry && (
                <div className="ml-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_date">Start Date</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value || undefined }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_date">End Date</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value || undefined }))}
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_first_order_only"
                  checked={formData.is_first_order_only}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, is_first_order_only: checked }))
                  }
                />
                <Label htmlFor="is_first_order_only">First order only</Label>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t pt-4 mt-6">
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-orange-500 hover:bg-orange-600">
              {coupon ? "Update Coupon" : "Create Coupon"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CouponModal;
