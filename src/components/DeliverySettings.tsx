
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
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
        <CardTitle>Delivery Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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
