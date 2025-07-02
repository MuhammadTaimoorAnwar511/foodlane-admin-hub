
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "@/components/AdminSidebar";
import DeliverySettings from "@/components/DeliverySettings";
import colors from "@/theme/colors";

const DeliverySettingsPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("adminLoggedIn");
    if (!isLoggedIn) {
      navigate("/admin-login");
    }
  }, [navigate]);

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: colors.backgrounds.main }}>
      <AdminSidebar />
      
      <main className="flex-1 p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Delivery Settings</h1>
          <p className="text-gray-600">Configure delivery time and charges</p>
        </div>

        <DeliverySettings />
      </main>
    </div>
  );
};

export default DeliverySettingsPage;
