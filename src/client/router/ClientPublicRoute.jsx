import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const ClientPublicRoute = () => {
  const token = localStorage.getItem("token");

  if (token) {
    return <Navigate to="/customer/overview" replace />;
  }

  return <Outlet />;
};

export default ClientPublicRoute;