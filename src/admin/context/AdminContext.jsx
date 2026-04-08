import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Outlet } from "react-router-dom";
import { getAdminMe } from "../api/adminApi";
import { getAdminToken, clearAdminAuth, setAdminName, setAdminCode, getAdminName, getAdminCode } from "../../utils/authUtils";

const AdminContext = createContext();

export const useAdmin = () => {
    const context = useContext(AdminContext);
    if (!context) {
        throw new Error("useAdmin must be used within an AdminProvider");
    }
    return context;
};

export const AdminProvider = ({ children }) => {
    const [admin, setAdmin] = useState({
        admin_name: getAdminName() || "",
        admin_code: getAdminCode() || "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchAdminMe = useCallback(async () => {
        const token = getAdminToken();
        if (!token) return;

        setLoading(true);
        try {
            const data = await getAdminMe();
            setAdmin({
                admin_name: data.admin_name,
                admin_code: data.admin_code,
            });
            // Update cache for initial load next time
            setAdminName(data.admin_name);
            setAdminCode(data.admin_code);
            setError(null);
        } catch (err) {
            console.error("Failed to fetch admin info:", err);
            setError(err);
            // If it's a 401, clearAdminAuth might already be handled by axios interceptor
            // but we can be safe here too if needed.
        } finally {
            setLoading(false);
        }
    }, []);

    const logout = useCallback(() => {
        clearAdminAuth();
        setAdmin({ admin_name: "", admin_code: "" });
    }, []);

    // Initial fetch on mount if token exists
    useEffect(() => {
        if (getAdminToken()) {
            fetchAdminMe();
        }
    }, [fetchAdminMe]);

    const value = {
        admin,
        loading,
        error,
        fetchAdminMe,
        logout,
        adminName: admin.admin_name,
        adminCode: admin.admin_code,
    };

    return <AdminContext.Provider value={value}>{children || <Outlet />}</AdminContext.Provider>;
};
