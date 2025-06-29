
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, User, Phone, MapPin } from "lucide-react";
import AdminSidebar from "@/components/AdminSidebar";
import { toast } from "sonner";

const Riders = () => {
  const navigate = useNavigate();
  const [riders, setRiders] = useState([
    {
      id: 1,
      name: "Alex Rodriguez",
      phone: "1234567890",
      password: "rider123",
      status: "active",
      ordersCompleted: 145,
      rating: 4.8,
      currentLocation: "Downtown Area"
    },
    {
      id: 2,
      name: "Sarah Johnson",
      phone: "1234567891",
      password: "rider456",
      status: "active",
      ordersCompleted: 98,
      rating: 4.9,
      currentLocation: "North District"
    },
    {
      id: 3,
      name: "Mike Chen",
      phone: "1234567892",
      password: "rider789",
      status: "offline",
      ordersCompleted: 67,
      rating: 4.6,
      currentLocation: "South Area"
    }
  ]);

  const [showDialog, setShowDialog] = useState(false);
  const [editingRider, setEditingRider] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    password: "",
    currentLocation: ""
  });

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("adminLoggedIn");
    if (!isLoggedIn) {
      navigate("/admin-login");
    }
  }, [navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newRider = {
      id: editingRider ? editingRider.id : Date.now(),
      ...formData,
      status: editingRider ? editingRider.status : "active",
      ordersCompleted: editingRider ? editingRider.ordersCompleted : 0,
      rating: editingRider ? editingRider.rating : 5.0
    };

    if (editingRider) {
      setRiders(riders.map(r => r.id === editingRider.id ? newRider : r));
      toast.success("Rider updated successfully!");
    } else {
      setRiders([...riders, newRider]);
      toast.success("Rider added successfully!");
    }

    setShowDialog(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      password: "",
      currentLocation: ""
    });
    setEditingRider(null);
  };

  const handleEdit = (rider: any) => {
    setEditingRider(rider);
    setFormData({
      name: rider.name,
      phone: rider.phone,
      password: rider.password,
      currentLocation: rider.currentLocation
    });
    setShowDialog(true);
  };

  const handleDelete = (id: number) => {
    setRiders(riders.filter(r => r.id !== id));
    toast.success("Rider deleted successfully!");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'offline':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      
      <main className="flex-1 p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Delivery Riders</h1>
            <p className="text-gray-600">Manage your delivery team</p>
          </div>
          
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button className="bg-orange-500 hover:bg-orange-600" onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Add Rider
              </Button>
            </DialogTrigger>
            
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingRider ? "Edit Rider" : "Add New Rider"}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Enter rider's full name"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="Enter phone number"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="password">Login Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="Set login password"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="location">Current Location</Label>
                  <Input
                    id="location"
                    value={formData.currentLocation}
                    onChange={(e) => setFormData({...formData, currentLocation: e.target.value})}
                    placeholder="e.g., Downtown Area, North District"
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-orange-500 hover:bg-orange-600">
                    {editingRider ? "Update" : "Add"} Rider
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {riders.map((rider) => (
            <Card key={rider.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                      <User className="h-6 w-6 text-orange-500" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{rider.name}</CardTitle>
                      <Badge className={`${getStatusColor(rider.status)} text-xs`}>
                        {rider.status.charAt(0).toUpperCase() + rider.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    <span className="text-sm">{rider.phone}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span className="text-sm">{rider.currentLocation}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-500">{rider.ordersCompleted}</p>
                    <p className="text-xs text-gray-600">Orders</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-500">{rider.rating}</p>
                    <p className="text-xs text-gray-600">Rating</p>
                  </div>
                </div>

                <div className="mb-4 p-2 bg-gray-50 rounded">
                  <p className="text-xs text-gray-600 mb-1">Login Credentials:</p>
                  <p className="text-xs"><strong>Phone:</strong> {rider.phone}</p>
                  <p className="text-xs"><strong>Password:</strong> {rider.password}</p>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(rider)}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(rider.id)}
                    className="flex-1"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Riders;
