
import { 
  LayoutDashboard, 
  Package, 
  FolderOpen, 
  ShoppingBag, 
  Users, 
  Clock,
  Store,
  LogOut,
  Menu,
  Truck
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import colors from "@/theme/colors";

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
    { icon: Store, label: "Shop Profile", path: "/admin/shop-profile" },
    { icon: Package, label: "Products", path: "/admin/products" },
    { icon: FolderOpen, label: "Categories", path: "/admin/categories" },
    { icon: ShoppingBag, label: "Orders", path: "/admin/orders" },
    { icon: Users, label: "Riders", path: "/admin/riders" },
    { icon: Clock, label: "Schedules", path: "/admin/schedules" },
    { icon: Truck, label: "Delivery Settings", path: "/admin/delivery-settings" },
  ];

  return (
    <div 
      className={`text-white h-screen flex flex-col transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}
      style={{ backgroundColor: colors.backgrounds.sidebar }}
    >
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

      <nav className="mt-8 flex-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors ${
                isActive ? 'text-white' : ''
              }`
            }
            style={({ isActive }) => ({
              backgroundColor: isActive ? colors.primary[600] : 'transparent'
            })}
          >
            <item.icon className="h-5 w-5" />
            <span className={`ml-3 ${collapsed ? 'hidden' : 'block'}`}>
              {item.label}
            </span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4">
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
