
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
  Bike,
  X,
  Gift,
  Ticket
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import colors from "@/theme/colors";

const AdminSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  // Handle mobile responsiveness
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("adminLoggedIn");
    toast.success("Logged out successfully");
    navigate("/admin-login");
  };

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
    { icon: Store, label: "Shop Profile", path: "/admin/shop-profile" },
    { icon: Package, label: "Products", path: "/admin/products" },
    { icon: Gift, label: "Deals", path: "/admin/deals" },
    { icon: Ticket, label: "Coupons", path: "/admin/coupons" },
    { icon: FolderOpen, label: "Categories", path: "/admin/categories" },
    { icon: ShoppingBag, label: "Orders", path: "/admin/orders" },
    { icon: Users, label: "Riders", path: "/admin/riders" },
    { icon: Clock, label: "Schedules", path: "/admin/schedules" },
    { icon: Bike, label: "Delivery Settings", path: "/admin/delivery-settings" },
  ];

  const handleNavClick = () => {
    if (window.innerWidth < 768) {
      setMobileOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="bg-white shadow-md border"
        >
          {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`
          text-white h-screen flex flex-col transition-all duration-300 z-50
          ${mobileOpen ? 'fixed left-0 top-0' : 'hidden'}
          md:relative md:flex
          ${collapsed ? 'md:w-16' : 'md:w-64'}
          w-64
        `}
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
              className="text-white hover:bg-gray-700 hidden md:flex"
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
              onClick={handleNavClick}
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
              <span className={`ml-3 ${collapsed ? 'md:hidden' : 'block'}`}>
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
            <span className={`ml-2 ${collapsed ? 'md:hidden' : 'block'}`}>
              Logout
            </span>
          </Button>
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;
