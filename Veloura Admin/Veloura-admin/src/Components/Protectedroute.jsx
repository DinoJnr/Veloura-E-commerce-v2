// components/ProtectedRoute.jsx

import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isLoggedIn, user } = useAuth();
  const location = useLocation();

  // Not logged in → redirect to login, remember where they were going
  if (!isLoggedIn)
    return <Navigate to="/admin/login" state={{ from: location }} replace />;

  // Logged in but not admin role on a restricted route
  if (adminOnly && user?.role !== "admin")
    return <Navigate to="/admin/dashboard" replace />;

  return children;
};

export default ProtectedRoute;