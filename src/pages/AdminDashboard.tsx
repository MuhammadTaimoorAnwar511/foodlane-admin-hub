
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingBag, Users, Settings } from "lucide-react";
import AdminSidebar from "@/components/AdminSidebar";
import DeliverySettings from "@/components/DeliverySettings";
import colors from "@/theme/colors";

const AdminDashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("adminLoggedIn");
    if (!isLoggedIn) {
      navigate("/admin-login");
    }
  }, [navigate]);

  const stats = [
    { title: "Total Products", value: "25", icon: Package, color: colors.status.info },
    { title: "Total Orders", value: "150", icon: ShoppingBag, color: colors.status.success },
    { title: "Active Riders", value: "8", icon: Users, color: colors.status.warning },
    { title: "Revenue Today", value: "PKR 45,000", icon: Settings, color: colors.primary[500] },
  ];

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: colors.backgrounds.main }}>
      <AdminSidebar />
      
      <main className="flex-1 p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-600">Welcome to your FastFood admin panel</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow" style={{ backgroundColor: colors.backgrounds.card }}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                  </div>
                  <stat.icon className="h-8 w-8" style={{ color: stat.color }} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DeliverySettings />
          
          <Card style={{ backgroundColor: colors.backgrounds.card }}>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">• Manage products and categories</p>
                <p className="text-sm text-gray-600">• Track orders and deliveries</p>
                <p className="text-sm text-gray-600">• Monitor rider performance</p>
                <p className="text-sm text-gray-600">• Update delivery settings</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
