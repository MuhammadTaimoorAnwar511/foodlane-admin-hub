
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "@/components/AdminSidebar";
import ShopProfileForm from "@/components/ShopProfileForm";
import colors from "@/theme/colors";

const ShopProfile = () => {
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
          <h1 className="text-3xl font-bold text-gray-800">Shop Profile</h1>
          <p className="text-gray-600">Manage your restaurant's public information</p>
        </div>

        <ShopProfileForm />
      </main>
    </div>
  );
};

export default ShopProfile;
