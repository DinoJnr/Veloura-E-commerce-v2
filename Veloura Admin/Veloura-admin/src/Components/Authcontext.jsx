// context/AuthContext.jsx

import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,  setUser]  = useState(() => {
    try { return JSON.parse(localStorage.getItem("veloura_user")) || null; }
    catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem("veloura_token") || null);

  // Attach token to every axios request automatically
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [token]);

  // Auto-logout on 401 from any axios response
  useEffect(() => {
    const id = axios.interceptors.response.use(
      (res) => res,
      (err) => {
        if (err.response?.status === 401) logout();
        return Promise.reject(err);
      }
    );
    return () => axios.interceptors.response.eject(id);
  }, []);

  const login = (userData, jwt) => {
    setUser(userData);
    setToken(jwt);
    localStorage.setItem("veloura_user",  JSON.stringify(userData));
    localStorage.setItem("veloura_token", jwt);
    axios.defaults.headers.common["Authorization"] = `Bearer ${jwt}`;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("veloura_user");
    localStorage.removeItem("veloura_token");
    delete axios.defaults.headers.common["Authorization"];
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoggedIn: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);