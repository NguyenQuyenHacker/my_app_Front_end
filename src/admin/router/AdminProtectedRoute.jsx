import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getAdminToken, isTokenExpired, clearAdminAuth } from "../../utils/authUtils";

const AdminProtectedRoute = () => {
  const token = getAdminToken();
  const location = useLocation();

  if (!token || isTokenExpired(token)) {
    if (token) clearAdminAuth();
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default AdminProtectedRoute;