
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Bike, User, Gift, Loader2 } from "lucide-react";
import { toast } from "sonner";
import colors from "@/theme/colors";
import { useDeliverySettings, useUpdateDeliverySettings } from "@/hooks/useDeliverySettings";

const DeliverySettings = () => {
  const { data: deliverySettings, isLoading } = useDeliverySettings();
  const updateDeliverySettings = useUpdateDeliverySettings();

  const [settings, setSettings] = useState({
    minDeliveryTime: 25,
    maxDeliveryTime: 30,
    deliveryCharges: 150,
    enableFreeDelivery: false,
    freeDeliveryThreshold: 1000
  });

  // Update local state when data is loaded from database
  useEffect(() => {
    if (deliverySettings) {
      setSettings({
        minDeliveryTime: deliverySettings.minDeliveryTime || 25,
        maxDeliveryTime: deliverySettings.maxDeliveryTime || 30,
        deliveryCharges: deliverySettings.deliveryCharges || 150,
        enableFreeDelivery: deliverySettings.enableFreeDelivery || false,
        freeDeliveryThreshold: deliverySettings.freeDeliveryThreshold || 1000
      });
    }
  }, [deliverySettings]);

  const handleSave = () => {
    // Validate that max delivery time is greater than min delivery time
    if (settings.maxDeliveryTime <= settings.minDeliveryTime) {
      toast.error("Max delivery time must be greater than min delivery time");
      return;
    }

    updateDeliverySettings.mutate(settings);
  };

  const handleMinTimeChange = (value: number) => {
    setSettings(prev => ({
      ...prev,
      minDeliveryTime: value,
      // Auto-adjust max time if it becomes less than or equal to min time
      maxDeliveryTime: prev.maxDeliveryTime <= value ? value + 5 : prev.maxDeliveryTime
    }));
  };

  const handleMaxTimeChange = (value: number) => {
    // Only allow max time if it's greater than min time
    if (value > settings.minDeliveryTime) {
      setSettings(prev => ({ ...prev, maxDeliveryTime: value }));
    }
  };

  if (isLoading) {
    return (
      <Card style={{ backgroundColor: colors.backgrounds.card }}>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading delivery settings...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card style={{ backgroundColor: colors.backgrounds.card }}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bike className="h-5 w-5 text-orange-500" />
          Delivery Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <Bike className="h-5 w-5 text-orange-500" />
            <h3 className="font-medium text-gray-900">Delivery Time</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="minTime">Min Delivery Time (mins)</Label>
              <Input
                id="minTime"
                type="number"
                min="1"
                value={settings.minDeliveryTime}
                onChange={(e) => handleMinTimeChange(parseInt(e.target.value) || 1)}
                required
              />
            </div>
            <div>
              <Label htmlFor="maxTime">Max Delivery Time (mins)</Label>
              <Input
                id="maxTime"
                type="number"
                min={settings.minDeliveryTime + 1}
                value={settings.maxDeliveryTime}
                onChange={(e) => handleMaxTimeChange(parseInt(e.target.value) || settings.minDeliveryTime + 1)}
                required
              />
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-orange-500" />
            <h3 className="font-medium text-gray-900">Delivery Charges</h3>
          </div>
          
          <div>
            <Label htmlFor="charges">Delivery Charges (PKR)</Label>
            <Input
              id="charges"
              type="number"
              min="0"
              value={settings.deliveryCharges}
              onChange={(e) => setSettings({...settings, deliveryCharges: parseInt(e.target.value) || 0})}
              required
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-orange-500" />
            <h3 className="font-medium text-gray-900">Free Delivery</h3>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="enableFreeDelivery"
              checked={settings.enableFreeDelivery}
              onCheckedChange={(checked) => setSettings({...settings, enableFreeDelivery: checked})}
            />
            <Label htmlFor="enableFreeDelivery">Enable free delivery for orders above threshold</Label>
          </div>

          {settings.enableFreeDelivery && (
            <div className="ml-6 space-y-2">
              <Label htmlFor="freeDeliveryThreshold">Free Delivery Threshold (PKR)</Label>
              <Input
                id="freeDeliveryThreshold"
                type="number"
                min="0"
                value={settings.freeDeliveryThreshold}
                onChange={(e) => setSettings({...settings, freeDeliveryThreshold: parseInt(e.target.value) || 0})}
                placeholder="1000"
              />
              <p className="text-sm text-gray-500">
                Orders above PKR {settings.freeDeliveryThreshold} will have free delivery
              </p>
            </div>
          )}
        </div>

        <div className="flex space-x-2">
          <Button 
            onClick={handleSave} 
            style={{ backgroundColor: colors.primary[500] }}
            disabled={updateDeliverySettings.isPending || settings.maxDeliveryTime <= settings.minDeliveryTime}
          >
            {updateDeliverySettings.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              'Save Settings'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DeliverySettings;
