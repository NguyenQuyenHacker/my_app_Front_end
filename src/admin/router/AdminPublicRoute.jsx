import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { getAdminToken, isTokenExpired } from "../../utils/authUtils";

const AdminPublicRoute = () => {
  const token = getAdminToken();

  // If a valid, non-expired token exists, redirect to dashboard
  if (token && !isTokenExpired(token)) {
    return <Navigate to="/admin/overviews" replace />;
  }

  return <Outlet />;
};

export default AdminPublicRoute;