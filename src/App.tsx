
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import Products from "./pages/Products";
import Deals from "./pages/Deals";
import Coupons from "./pages/Coupons";
import Categories from "./pages/Categories";
import Orders from "./pages/Orders";
import Riders from "./pages/Riders";
import Schedules from "./pages/Schedules";
import ShopProfile from "./pages/ShopProfile";
import DeliverySettingsPage from "./pages/DeliverySettings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/shop-profile" element={<ShopProfile />} />
          <Route path="/admin/products" element={<Products />} />
          <Route path="/admin/deals" element={<Deals />} />
          <Route path="/admin/coupons" element={<Coupons />} />
          <Route path="/admin/categories" element={<Categories />} />
          <Route path="/admin/orders" element={<Orders />} />
          <Route path="/admin/riders" element={<Riders />} />
          <Route path="/admin/schedules" element={<Schedules />} />
          <Route path="/admin/schedules/overview" element={<Schedules />} />
          <Route path="/admin/schedules/edit" element={<Schedules />} />
          <Route path="/admin/delivery-settings" element={<DeliverySettingsPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
