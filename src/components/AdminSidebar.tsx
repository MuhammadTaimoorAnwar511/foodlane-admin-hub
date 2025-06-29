
import { 
  LayoutDashboard, 
  Package, 
  FolderOpen, 
  ShoppingBag, 
  Users, 
  LogOut,
  Menu
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

const AdminSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("adminLoggedIn");
    toast.success("Logged out successfully");
    navigate("/admin-login");
  };

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
    { icon: Package, label: "Products", path: "/admin/products" },
    { icon: FolderOpen, label: "Categories", path: "/admin/categories" },
    { icon: ShoppingBag, label: "Orders", path: "/admin/orders" },
    { icon: Users, label: "Riders", path: "/admin/riders" },
  ];

  return (
    <div className={`bg-gray-800 text-white h-screen transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <h2 className={`font-bold text-xl ${collapsed ? 'hidden' : 'block'}`}>
            🍔 FastFood Admin
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="text-white hover:bg-gray-700"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <nav className="mt-8">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors ${
                isActive ? 'bg-orange-600 text-white' : ''
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            <span className={`ml-3 ${collapsed ? 'hidden' : 'block'}`}>
              {item.label}
            </span>
          </NavLink>
        ))}
      </nav>

      <div className="absolute bottom-4 left-4 right-4">
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full text-gray-300 hover:bg-red-600 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          <span className={`ml-2 ${collapsed ? 'hidden' : 'block'}`}>
            Logout
          </span>
        </Button>
      </div>
    </div>
  );
};

export default AdminSidebar;
