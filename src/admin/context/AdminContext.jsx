import React, { createContext, useContext, useCallback, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAdminMe } from "../api/adminApi";
import {
  getAdminToken,
  clearAdminAuth,
  setAdminName,
  setAdminCode,
  getAdminName,
  getAdminCode,
} from "../../utils/authUtils";

const AdminContext = createContext();

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
};

export const AdminProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const hasToken = !!getAdminToken();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["adminMe"],
    queryFn: getAdminMe,
    enabled: hasToken,
    staleTime: 5 * 60_000,
    initialData: () => {
      const name = getAdminName();
      const code = getAdminCode();
      if (name || code) {
        return { admin_name: name || "", admin_code: code || "" };
      }
      return undefined;
    },
  });

  useEffect(() => {
    if (data?.admin_name) setAdminName(data.admin_name);
    if (data?.admin_code) setAdminCode(data.admin_code);
  }, [data?.admin_name, data?.admin_code]);

  const logout = useCallback(() => {
    clearAdminAuth();
    queryClient.removeQueries({ queryKey: ["adminMe"] });
  }, [queryClient]);

  const admin = {
    admin_name: data?.admin_name || "",
    admin_code: data?.admin_code || "",
  };

  const value = {
    admin,
    loading: isLoading,
    error,
    fetchAdminMe: refetch,
    logout,
    adminName: admin.admin_name,
    adminCode: admin.admin_code,
  };

  return <AdminContext.Provider value={value}>{children || <Outlet />}</AdminContext.Provider>;
};
