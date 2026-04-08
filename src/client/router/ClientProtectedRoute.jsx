import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getClientToken, isTokenExpired, clearClientToken } from "../../utils/authUtils";

const ClientProtectedRoute = () => {
  const token = getClientToken();
  const location = useLocation();

  if (!token || isTokenExpired(token)) {
    if (token) clearClientToken();
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default ClientProtectedRoute;