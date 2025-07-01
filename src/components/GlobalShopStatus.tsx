
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, CheckCircle } from "lucide-react";
import colors from "@/theme/colors";

interface GlobalShopStatus {
  isOpen: boolean;
  closedMessage: string;
}

interface GlobalShopStatusProps {
  status: GlobalShopStatus;
  onStatusChange: (status: GlobalShopStatus) => void;
}

const GlobalShopStatus = ({ status, onStatusChange }: GlobalShopStatusProps) => {
  return (
    <Card style={{ backgroundColor: colors.backgrounds.card }}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {status.isOpen ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-600" />
          )}
          Global Shop Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base font-medium">
              Shop Status
            </Label>
            <p className="text-sm text-gray-600">
              Emergency override for immediate shop closure
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <span className={`text-sm font-medium ${status.isOpen ? 'text-green-600' : 'text-red-600'}`}>
              {status.isOpen ? 'OPEN' : 'CLOSED'}
            </span>
            <Switch
              checked={status.isOpen}
              onCheckedChange={(checked) => 
                onStatusChange({ ...status, isOpen: checked })
              }
            />
          </div>
        </div>

        {!status.isOpen && (
          <div className="space-y-2">
            <Label htmlFor="closedMessage">
              Closure Message for Customers
            </Label>
            <Textarea
              id="closedMessage"
              value={status.closedMessage}
              onChange={(e) => 
                onStatusChange({ ...status, closedMessage: e.target.value })
              }
              placeholder="Enter message to display when shop is closed..."
              className="resize-none"
              rows={3}
            />
          </div>
        )}

        <div className={`p-3 rounded-lg border ${
          status.isOpen 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <p className="text-sm font-medium">
            {status.isOpen 
              ? '✓ Shop is currently accepting orders' 
              : '✗ Shop is temporarily closed to new orders'
            }
          </p>
          {!status.isOpen && status.closedMessage && (
            <p className="text-sm mt-1 opacity-80">
              Customer message: "{status.closedMessage}"
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default GlobalShopStatus;
