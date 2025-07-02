
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Bike, User } from "lucide-react";
import colors from "@/theme/colors";

const DeliverySettings = () => {
  const [settings, setSettings] = useState({
    minDeliveryTime: 25,
    maxDeliveryTime: 30,
    deliveryCharges: 150
  });

  const handleSave = () => {
    localStorage.setItem("deliverySettings", JSON.stringify(settings));
    toast.success("Delivery settings updated successfully!");
  };

  const handleReset = () => {
    const savedSettings = localStorage.getItem("deliverySettings");
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  };

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

        <div className="flex space-x-2">
          <Button onClick={handleSave} style={{ backgroundColor: colors.primary[500] }}>
            Save Settings
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
