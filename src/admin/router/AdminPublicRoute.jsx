import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const AdminPublicRoute = () => {
  const token = localStorage.getItem("admin_access_token");

  if (token) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Outlet />;
};

export default AdminPublicRoute;