// src/utils/authUtils.js

/**
 * Parses a JWT token to get its payload.
 * @param {string} token 
 * @returns {object|null}
 */
export const parseJwt = (token) => {
    try {
        if (!token || typeof token !== "string") return null;
        const base64Url = token.split(".")[1];
        if (!base64Url) return null;
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split("")
                .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                .join("")
        );
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("JWT parse error:", e);
        return null;
    }
};

/**
 * Checks if a JWT token is expired.
 * @param {string} token 
 * @returns {boolean} Returns true if expired or invalid.
 */
export const isTokenExpired = (token) => {
    const payload = parseJwt(token);
    if (!payload || !payload.exp) return true;
    
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
};

// Storage keys
const ADMIN_TOKEN_KEY = "admin_access_token";
const CLIENT_TOKEN_KEY = "token";

// Admin helpers
export const getAdminToken = () => localStorage.getItem(ADMIN_TOKEN_KEY);
export const setAdminToken = (token) => localStorage.setItem(ADMIN_TOKEN_KEY, token);
export const clearAdminToken = () => localStorage.removeItem(ADMIN_TOKEN_KEY);

export const getAdminName = () => localStorage.getItem("admin_name");
export const setAdminName = (name) => localStorage.setItem("admin_name", name);
export const clearAdminName = () => localStorage.removeItem("admin_name");

export const getAdminCode = () => localStorage.getItem("admin_code");
export const setAdminCode = (code) => localStorage.setItem("admin_code", code);
export const clearAdminCode = () => localStorage.removeItem("admin_code");

export const clearAdminAuth = () => {
    clearAdminToken();
    clearAdminName();
    clearAdminCode();
};

// Client helpers
export const getClientToken = () => localStorage.getItem(CLIENT_TOKEN_KEY);
export const setClientToken = (token) => {
    localStorage.setItem(CLIENT_TOKEN_KEY, token);
    window.dispatchEvent(new Event("client-auth-changed"));
};
export const clearClientToken = () => {
    localStorage.removeItem(CLIENT_TOKEN_KEY);
    window.dispatchEvent(new Event("client-auth-changed"));
};
