import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, MapPin, Phone, DollarSign } from "lucide-react";
import AdminSidebar from "@/components/AdminSidebar";
import { toast } from "sonner";
import colors from "@/theme/colors";

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([
    {
      id: "#12345",
      customer: "John Doe",
      phone: "+923001234567",
      address: "123 Main St, Karachi",
      items: [
        { 
          name: "Chicken Burger", 
          quantity: 2, 
          basePrice: 999,
          variant: { name: "Large", price: 1299 },
          addons: [{ name: "Extra Cheese", price: 150 }]
        },
        { 
          name: "Fries", 
          quantity: 1, 
          basePrice: 299,
          variant: null,
          addons: []
        },
        { 
          name: "Coke", 
          quantity: 2, 
          basePrice: 199,
          variant: { name: "Large", price: 299 },
          addons: []
        }
      ],
      total: 3450,
      status: "queued",
      orderTime: "2 mins ago",
      estimatedDelivery: "25-30 mins"
    },
    {
      id: "#12346",
      customer: "Jane Smith",
      phone: "+923001234568",
      address: "456 Oak Ave, Lahore",
      items: [
        { 
          name: "Margherita Pizza", 
          quantity: 1, 
          basePrice: 1299,
          variant: { name: "Medium", price: 1599 },
          addons: [
            { name: "Extra Cheese", price: 200 },
            { name: "Olives", price: 150 }
          ]
        },
        { 
          name: "Garlic Bread", 
          quantity: 1, 
          basePrice: 449,
          variant: null,
          addons: []
        }
      ],
      total: 2899,
      status: "processing",
      orderTime: "15 mins ago",
      estimatedDelivery: "20-25 mins"
    },
    {
      id: "#12347",
      customer: "Mike Johnson",
      phone: "+923001234569",
      address: "789 Pine St, Islamabad",
      items: [
        { 
          name: "Fried Chicken", 
          quantity: 3, 
          basePrice: 899,
          variant: { name: "Spicy", price: 999 },
          addons: [{ name: "Extra Sauce", price: 75 }]
        },
        { 
          name: "Coleslaw", 
          quantity: 2, 
          basePrice: 199,
          variant: null,
          addons: []
        }
      ],
      total: 4575,
      status: "delivered",
      orderTime: "1 hour ago",
      estimatedDelivery: "Delivered"
    }
  ]);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("adminLoggedIn");
    if (!isLoggedIn) {
      navigate("/admin-login");
    }
  }, [navigate]);

  const handleStatusChange = (orderId: string, newStatus: string) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
    toast.success(`Order ${orderId} status updated to ${newStatus}`);
  };

  const getStatusColor = (status: string) => {
    const statusColors = colors.orderStatus;
    switch (status) {
      case 'queued':
        return `bg-[${statusColors.queued.bg}] text-[${statusColors.queued.text}]`;
      case 'processing':
        return `bg-[${statusColors.processing.bg}] text-[${statusColors.processing.text}]`;
      case 'delivered':
        return `bg-[${statusColors.delivered.bg}] text-[${statusColors.delivered.text}]`;
      case 'canceled':
        return `bg-[${statusColors.canceled.bg}] text-[${statusColors.canceled.text}]`;
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getItemPrice = (item: any) => {
    let price = item.variant ? item.variant.price : item.basePrice;
    if (item.addons && item.addons.length > 0) {
      price += item.addons.reduce((sum: number, addon: any) => sum + addon.price, 0);
    }
    return price;
  };

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: colors.backgrounds.main }}>
      <AdminSidebar />
      
      <main className="flex-1 p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Orders</h1>
          <p className="text-gray-600">Track and manage customer orders</p>
        </div>

        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order.id} className="hover:shadow-lg transition-shadow" style={{ backgroundColor: colors.backgrounds.card }}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl text-gray-800">
                      Order {order.id}
                    </CardTitle>
                    <div className="flex items-center text-gray-600 mt-2">
                      <Clock className="h-4 w-4 mr-1" />
                      <span className="text-sm">{order.orderTime}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={`${getStatusColor(order.status)} mb-2`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                    <div className="text-2xl font-bold text-gray-800">
                      PKR {order.total}
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Customer Info */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Customer Details</h4>
                    <div className="space-y-2">
                      <p className="text-gray-700">{order.customer}</p>
                      <div className="flex items-center text-gray-600">
                        <Phone className="h-4 w-4 mr-2" />
                        <span className="text-sm">{order.phone}</span>
                      </div>
                      <div className="flex items-start text-gray-600">
                        <MapPin className="h-4 w-4 mr-2 mt-0.5" />
                        <span className="text-sm">{order.address}</span>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Order Items</h4>
                    <div className="space-y-3">
                      {order.items.map((item, index) => (
                        <div key={index} className="border-l-2 border-orange-200 pl-3">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="font-medium text-gray-800">
                                {item.name} x{item.quantity}
                              </p>
                              {item.variant && (
                                <p className="text-xs text-blue-600">
                                  • Variant: {item.variant.name}
                                </p>
                              )}
                              {item.addons && item.addons.length > 0 && (
                                <div className="text-xs text-green-600">
                                  {item.addons.map((addon: any, addonIndex: number) => (
                                    <p key={addonIndex}>• {addon.name}</p>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-800">
                                PKR {getItemPrice(item) * item.quantity}
                              </p>
                              <p className="text-xs text-gray-500">
                                PKR {getItemPrice(item)} each
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Actions</h4>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        <strong>Delivery:</strong> {order.estimatedDelivery}
                      </p>
                      <Select
                        value={order.status}
                        onValueChange={(value) => handleStatusChange(order.id, value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Change status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="queued">Queued</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="canceled">Canceled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Orders;
