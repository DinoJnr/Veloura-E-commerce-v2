// Components/ProtectedRoute.jsx  (Logistics App)

import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";;

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn, user } = useAuth();
  const location = useLocation();

  if (!isLoggedIn)
    return <Navigate to="/" state={{ from: location }} replace />;

  // Block admin accounts from accessing logistics portal
  if (user?.role !== "logistics")
    return <Navigate to="/" replace />;

  return children;
};

export default ProtectedRoute;