import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { getClientToken, isTokenExpired } from "../../utils/authUtils";

const ClientPublicRoute = () => {
  const token = getClientToken();

  if (token && !isTokenExpired(token)) {
    return <Navigate to="/customer" replace />;
  }

  return <Outlet />;
};

export default ClientPublicRoute;