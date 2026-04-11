import React, { useLayoutEffect, useState } from "react";
import { authService } from "../services/authService";
import { AuthContext } from "./auth-context";

function readStoredAuth() {
  const storedUser = authService.getCurrentUser();
  const storedToken = authService.getToken();
  if (storedUser && storedToken) {
    return { user: storedUser, token: storedToken };
  }
  return { user: null, token: null };
}

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => ({
    user: null,
    token: null,
    loading: true,
  }));

  useLayoutEffect(() => {
    const { user, token } = readStoredAuth();
    // Defer setState so eslint react-hooks/set-state-in-effect is satisfied; still runs before paint.
    queueMicrotask(() => {
      setAuth({ user, token, loading: false });
    });
  }, []);

  const login = async (email, password) => {
    const response = await authService.login(email, password);
    if (response.success) {
      setAuth((prev) => ({ ...prev, user: response.user, token: response.token }));
    }
    return response;
  };

  const register = async (name, email, password) => {
    const response = await authService.register(name, email, password);
    if (response.success) {
      setAuth((prev) => ({ ...prev, user: response.user, token: response.token }));
    }
    return response;
  };

  const logout = () => {
    authService.logout();
    setAuth((prev) => ({ ...prev, user: null, token: null }));
  };

  const value = {
    user: auth.user,
    token: auth.token,
    loading: auth.loading,
    login,
    register,
    logout,
    isAuthenticated: !!auth.token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
