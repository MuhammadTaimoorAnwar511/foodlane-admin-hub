
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, User, Phone } from "lucide-react";
import AdminSidebar from "@/components/AdminSidebar";
import { toast } from "sonner";
import colors from "@/theme/colors";

const Riders = () => {
  const navigate = useNavigate();
  const [riders, setRiders] = useState([
    {
      id: 1,
      name: "Alex Rodriguez",
      phone: "+923001234567",
      password: "rider123",
      status: "active",
      ordersCompleted: 145
    },
    {
      id: 2,
      name: "Sarah Johnson",
      phone: "+923001234568",
      password: "rider456",
      status: "active",
      ordersCompleted: 98
    },
    {
      id: 3,
      name: "Mike Chen",
      phone: "+923001234569",
      password: "rider789",
      status: "offline",
      ordersCompleted: 67
    }
  ]);

  const [showDialog, setShowDialog] = useState(false);
  const [editingRider, setEditingRider] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    password: ""
  });

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("adminLoggedIn");
    if (!isLoggedIn) {
      navigate("/admin-login");
    }
  }, [navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Enhanced validation for required fields
    if (!formData.name.trim()) {
      toast.error("Full name is required");
      return;
    }
    
    if (!formData.phone.trim()) {
      toast.error("Phone number is required");
      return;
    }
    
    if (!formData.password.trim()) {
      toast.error("Password is required");
      return;
    }
    
    const newRider = {
      id: editingRider ? editingRider.id : Date.now(),
      ...formData,
      status: editingRider ? editingRider.status : "active",
      ordersCompleted: editingRider ? editingRider.ordersCompleted : 0
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
      password: ""
    });
    setEditingRider(null);
  };

  const handleEdit = (rider: any) => {
    setEditingRider(rider);
    setFormData({
      name: rider.name,
      phone: rider.phone,
      password: rider.password
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
    <div className="flex min-h-screen" style={{ backgroundColor: colors.backgrounds.main }}>
      <AdminSidebar />
      
      <main className="flex-1 p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Delivery Riders</h1>
            <p className="text-gray-600">Manage your delivery team</p>
          </div>
          
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button style={{ backgroundColor: colors.primary[500] }} className="hover:opacity-90" onClick={resetForm}>
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
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Enter rider's full name"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
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
                  <Label htmlFor="password">Login Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="Set login password"
                    required
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" style={{ backgroundColor: colors.primary[500] }} className="hover:opacity-90">
                    {editingRider ? "Update" : "Add"} Rider
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {riders.map((rider) => (
            <Card key={rider.id} className="hover:shadow-lg transition-shadow" style={{ backgroundColor: colors.backgrounds.card }}>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center mr-3" style={{ backgroundColor: colors.primary[100] }}>
                      <User className="h-6 w-6" style={{ color: colors.primary[500] }} />
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
                </div>

                <div className="text-center mb-4">
                  <p className="text-2xl font-bold" style={{ color: colors.primary[500] }}>{rider.ordersCompleted}</p>
                  <p className="text-xs text-gray-600">Orders Completed</p>
                </div>

                <div className="mb-4 p-2 rounded" style={{ backgroundColor: colors.backgrounds.main }}>
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
