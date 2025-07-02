
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Package, ShoppingBag, Users, TrendingUp } from "lucide-react";
import AdminSidebar from "@/components/AdminSidebar";
import colors from "@/theme/colors";

const AdminDashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("adminLoggedIn");
    if (!isLoggedIn) {
      navigate("/admin-login");
    }
  }, [navigate]);

  // Sample data for charts
  const salesData = [
    { name: 'Mon', sales: 120 },
    { name: 'Tue', sales: 190 },
    { name: 'Wed', sales: 300 },
    { name: 'Thu', sales: 500 },
    { name: 'Fri', sales: 200 },
    { name: 'Sat', sales: 280 },
    { name: 'Sun', sales: 180 },
  ];

  const stats = [
    { title: "Total Products", value: "156", icon: Package, color: "bg-blue-500" },
    { title: "Total Orders", value: "1,234", icon: ShoppingBag, color: "bg-green-500" },
    { title: "Active Riders", value: "12", icon: Users, color: "bg-purple-500" },
    { title: "Revenue", value: "₨45,678", icon: TrendingUp, color: "bg-orange-500" },
  ];

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: colors.backgrounds.main }}>
      <AdminSidebar />
      
      <main className="flex-1 p-4 md:p-6">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">Welcome back! Here's your restaurant overview.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          {stats.map((stat, index) => (
            <Card key={index} style={{ backgroundColor: colors.backgrounds.card }}>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs md:text-sm font-medium text-gray-600 truncate">{stat.title}</p>
                    <p className="text-xl md:text-2xl font-bold text-gray-900 truncate">{stat.value}</p>
                  </div>
                  <div className={`p-2 md:p-3 rounded-full ${stat.color} flex-shrink-0 ml-2`}>
                    <stat.icon className="h-5 w-5 md:h-6 md:w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Sales Chart */}
        <Card style={{ backgroundColor: colors.backgrounds.card }}>
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-lg md:text-xl">Weekly Sales Overview</CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            <div className="w-full h-64 md:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12 }}
                    interval={0}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="sales" fill={colors.primary[500]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminDashboard;
