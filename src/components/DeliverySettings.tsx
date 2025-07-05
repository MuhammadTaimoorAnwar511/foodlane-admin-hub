
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Bike, User, Gift, Loader2 } from "lucide-react";
import colors from "@/theme/colors";
import { useDeliverySettings, useUpdateDeliverySettings } from "@/hooks/useDeliverySettings";

const DeliverySettings = () => {
  const { data: deliverySettings, isLoading } = useDeliverySettings();
  const updateDeliverySettings = useUpdateDeliverySettings();

  const [settings, setSettings] = useState({
    minDeliveryTime: 25,
    maxDeliveryTime: 30,
    deliveryCharges: 150,
    freeDeliveryEnabled: false,
    freeDeliveryThreshold: 1000
  });

  // Update local state when data is loaded from database
  useEffect(() => {
    if (deliverySettings) {
      setSettings({
        minDeliveryTime: deliverySettings.estimatedDeliveryTime || 25,
        maxDeliveryTime: (deliverySettings.estimatedDeliveryTime || 25) + 5,
        deliveryCharges: deliverySettings.deliveryFee || 150,
        freeDeliveryEnabled: deliverySettings.enableFreeDelivery || false,
        freeDeliveryThreshold: deliverySettings.freeDeliveryThreshold || 1000
      });
    }
  }, [deliverySettings]);

  const handleSave = () => {
    const updatedSettings = {
      deliveryFee: settings.deliveryCharges,
      freeDeliveryThreshold: settings.freeDeliveryThreshold,
      deliveryRadius: deliverySettings?.deliveryRadius || 10,
      estimatedDeliveryTime: settings.minDeliveryTime,
      enableFreeDelivery: settings.freeDeliveryEnabled
    };

    updateDeliverySettings.mutate(updatedSettings);
  };

  const handleReset = () => {
    if (deliverySettings) {
      setSettings({
        minDeliveryTime: deliverySettings.estimatedDeliveryTime || 25,
        maxDeliveryTime: (deliverySettings.estimatedDeliveryTime || 25) + 5,
        deliveryCharges: deliverySettings.deliveryFee || 150,
        freeDeliveryEnabled: deliverySettings.enableFreeDelivery || false,
        freeDeliveryThreshold: deliverySettings.freeDeliveryThreshold || 1000
      });
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
                value={settings.minDeliveryTime}
                onChange={(e) => setSettings({...settings, minDeliveryTime: parseInt(e.target.value)})}
                required
              />
            </div>
            <div>
              <Label htmlFor="maxTime">Max Delivery Time (mins)</Label>
              <Input
                id="maxTime"
                type="number"
                value={settings.maxDeliveryTime}
                onChange={(e) => setSettings({...settings, maxDeliveryTime: parseInt(e.target.value)})}
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
              value={settings.deliveryCharges}
              onChange={(e) => setSettings({...settings, deliveryCharges: parseInt(e.target.value)})}
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
              id="freeDeliveryEnabled"
              checked={settings.freeDeliveryEnabled}
              onCheckedChange={(checked) => setSettings({...settings, freeDeliveryEnabled: checked})}
            />
            <Label htmlFor="freeDeliveryEnabled">Enable free delivery for orders above threshold</Label>
          </div>

          {settings.freeDeliveryEnabled && (
            <div className="ml-6 space-y-2">
              <Label htmlFor="freeDeliveryThreshold">Free Delivery Threshold (PKR)</Label>
              <Input
                id="freeDeliveryThreshold"
                type="number"
                min="0"
                value={settings.freeDeliveryThreshold}
                onChange={(e) => setSettings({...settings, freeDeliveryThreshold: parseInt(e.target.value)})}
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
            disabled={updateDeliverySettings.isPending}
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
          <Button onClick={handleReset} variant="outline">
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DeliverySettings;
