
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, MapPin, Phone, DollarSign } from "lucide-react";
import AdminSidebar from "@/components/AdminSidebar";
import { toast } from "sonner";

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([
    {
      id: "#12345",
      customer: "John Doe",
      phone: "+923001234567",
      address: "123 Main St, Karachi",
      items: ["Chicken Burger x2", "Fries x1", "Coke x2"],
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
      items: ["Margherita Pizza x1", "Garlic Bread x1"],
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
      items: ["Fried Chicken x3", "Coleslaw x2"],
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
    switch (status) {
      case 'queued':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'canceled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      
      <main className="flex-1 p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Orders</h1>
          <p className="text-gray-600">Track and manage customer orders</p>
        </div>

        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order.id} className="hover:shadow-lg transition-shadow">
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
                    <div className="space-y-1">
                      {order.items.map((item, index) => (
                        <p key={index} className="text-sm text-gray-600">
                          • {item}
                        </p>
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
