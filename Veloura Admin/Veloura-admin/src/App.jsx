import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "./assets/vite.svg";
import heroImg from "./assets/hero.png";
import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import VelouraAdminNavbar from "./Components/VelouraAdminNavbar";
import VelouraDashboard from "./Components/VelouraDashboard";
import VelouraAddProduct from "./Components/VelouraAddProduct";
import VelouraLogin from "./Components/VelouraLogin";
import VelouraEditProduct from "./Components/VelouraEditProduct";
import VelouraAllProducts from "./Components/VelouraAllProducts";
import VelouraViewProduct from "./Components/VelouraViewProduct";
import VelouraOrdersPage from "./Components/VelouraOrdersPage";
import VelouraPendingOrders from "./Components/VelouraPendingOrders";
import VelouraAcceptedOrders from "./Components/VelouraAcceptedOrders";
import VelouraProcessingOrders from "./Components/VelouraProcessingOrders";
import VelouraDispatchedOrders from "./Components/VelouraDispatchedOrders";
import VelouraReceivedOrders from "./Components/VelouraReceivedOrders";
import Velouratransitorders from "./Components/Velouratransitorders";
import VelouraRejected from "./Components/VelouraRejected";
import VelouraRefund from "./Components/VelouraRefund";
import VelouraReturnPending from "./Components/VelouraReturnPending";
import VelouraInquiries from "./Components/VelouraInquiries";
import VelouraTransaction from "./Components/VelouraTransaction";
import VelouraSettings from "./Components/VelouraSettings";
import VelouraProfile from "./Components/VelouraProfile"
import { AuthProvider } from "./Components/AuthContext";
import ProtectedRoute from "./Components/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* ── PUBLIC ── */}
          <Route path="/" element={<VelouraLogin />} />

          {/* ── PROTECTED ── */}
          <Route path="/admin/navbar"           element={<ProtectedRoute><VelouraAdminNavbar /></ProtectedRoute>} />
          <Route path="/admin/dashboard"        element={<ProtectedRoute><VelouraDashboard /></ProtectedRoute>} />
          <Route path="/admin/addproduct"       element={<ProtectedRoute><VelouraAddProduct /></ProtectedRoute>} />
          <Route path="/admin/editproduct/:id"  element={<ProtectedRoute><VelouraEditProduct /></ProtectedRoute>} />
          <Route path="/admin/products"         element={<ProtectedRoute><VelouraAllProducts /></ProtectedRoute>} />
          <Route path="/admin/viewproduct"      element={<ProtectedRoute><VelouraViewProduct /></ProtectedRoute>} />
          <Route path="/admin/orders"           element={<ProtectedRoute><VelouraOrdersPage /></ProtectedRoute>} />
          <Route path="/admin/pendngorders"     element={<ProtectedRoute><VelouraPendingOrders /></ProtectedRoute>} />
          <Route path="/admin/rejected"         element={<ProtectedRoute><VelouraRejected /></ProtectedRoute>} />
          <Route path="/admin/acceptorders"     element={<ProtectedRoute><VelouraAcceptedOrders /></ProtectedRoute>} />
          <Route path="/admin/processing"       element={<ProtectedRoute><VelouraProcessingOrders /></ProtectedRoute>} />
          <Route path="/admin/dispatched"       element={<ProtectedRoute><VelouraDispatchedOrders /></ProtectedRoute>} />
          <Route path="/admin/recieved"         element={<ProtectedRoute><VelouraReceivedOrders /></ProtectedRoute>} />
          <Route path="/admin/transit"          element={<ProtectedRoute><Velouratransitorders /></ProtectedRoute>} />
          <Route path="/admin/refund"           element={<ProtectedRoute><VelouraRefund /></ProtectedRoute>} />
          <Route path="/admin/return-pending"   element={<ProtectedRoute><VelouraReturnPending /></ProtectedRoute>} />
          <Route path="/admin/pending-inquries" element={<ProtectedRoute><VelouraInquiries /></ProtectedRoute>} />
          <Route path="/admin/transaction"      element={<ProtectedRoute><VelouraTransaction /></ProtectedRoute>} />
          <Route path="/admin/setting"          element={<ProtectedRoute><VelouraSettings /></ProtectedRoute>} />
           <Route path="/admin/profile"          element={<ProtectedRoute><VelouraProfile /></ProtectedRoute>} />

          {/* ── CATCH-ALL → back to login ── */}
          <Route path="*" element={<VelouraLogin />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;