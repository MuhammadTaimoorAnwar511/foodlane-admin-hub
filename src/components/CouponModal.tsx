
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

interface Coupon {
  id?: string;
  code: string;
  name: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrderAmount?: number;
  maxUses?: number;
  usedCount: number;
  status: "active" | "inactive" | "expired";
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
}

interface CouponModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coupon?: Coupon | null;
  onSave: (coupon: Coupon) => void;
}

const CouponModal = ({ open, onOpenChange, coupon, onSave }: CouponModalProps) => {
  const [formData, setFormData] = useState<Coupon>({
    code: "",
    name: "",
    discountType: "percentage",
    discountValue: 0,
    usedCount: 0,
    status: "active",
    createdAt: new Date(),
  });

  const [hasExpiry, setHasExpiry] = useState(false);
  const [hasUsageLimit, setHasUsageLimit] = useState(false);
  const [hasMinOrder, setHasMinOrder] = useState(false);

  useEffect(() => {
    if (coupon) {
      setFormData(coupon);
      setHasExpiry(!!coupon.endDate);
      setHasUsageLimit(!!coupon.maxUses);
      setHasMinOrder(!!coupon.minOrderAmount);
    } else {
      setFormData({
        code: "",
        name: "",
        discountType: "percentage",
        discountValue: 0,
        usedCount: 0,
        status: "active",
        createdAt: new Date(),
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
    if (!formData.code || !formData.name || !formData.discountValue) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.discountType === "percentage" && formData.discountValue > 100) {
      toast.error("Percentage discount cannot exceed 100%");
      return;
    }

    const couponData: Coupon = {
      ...formData,
      minOrderAmount: hasMinOrder ? formData.minOrderAmount : undefined,
      maxUses: hasUsageLimit ? formData.maxUses : undefined,
      endDate: hasExpiry ? formData.endDate : undefined,
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
                  value={formData.discountType} 
                  onValueChange={(value: "percentage" | "fixed") => 
                    setFormData(prev => ({ ...prev, discountType: value }))
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
                    <SelectItem value="fixed">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Fixed Amount (PKR)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="discountValue">
                  Discount Value * 
                  {formData.discountType === "percentage" ? " (%)" : " (PKR)"}
                </Label>
                <Input
                  id="discountValue"
                  type="number"
                  min="0"
                  max={formData.discountType === "percentage" ? "100" : undefined}
                  value={formData.discountValue}
                  onChange={(e) => setFormData(prev => ({ ...prev, discountValue: parseFloat(e.target.value) || 0 }))}
                  placeholder={formData.discountType === "percentage" ? "20" : "100"}
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
                  <Label htmlFor="minOrderAmount">Minimum Order Amount (PKR)</Label>
                  <Input
                    id="minOrderAmount"
                    type="number"
                    min="0"
                    value={formData.minOrderAmount || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, minOrderAmount: parseFloat(e.target.value) || undefined }))}
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
                  <Label htmlFor="maxUses">Maximum Uses</Label>
                  <Input
                    id="maxUses"
                    type="number"
                    min="1"
                    value={formData.maxUses || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxUses: parseInt(e.target.value) || undefined }))}
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
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate ? formData.startDate.toISOString().split('T')[0] : ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value ? new Date(e.target.value) : undefined }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate ? formData.endDate.toISOString().split('T')[0] : ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value ? new Date(e.target.value) : undefined }))}
                    />
                  </div>
                </div>
              )}
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
