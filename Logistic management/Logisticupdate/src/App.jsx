import { BrowserRouter, Route, Routes } from "react-router-dom";
import VelourlogisticUpdate from "./Components/VelouralogisticUpdate";
import VelouraLogin         from "./Components/VelouraLogin";
import { AuthProvider }     from "./Components/AuthContext";
import ProtectedRoute       from "./Components/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* ── PUBLIC ── */}
          <Route path="/" element={<VelouraLogin />} />

          {/* ── PROTECTED — logistics role only ── */}
          <Route
            path="/veloura/updatelogistics"
            element={
              <ProtectedRoute>
                <VelourlogisticUpdate />
              </ProtectedRoute>
            }
          />

          {/* ── CATCH-ALL → login ── */}
          <Route path="*" element={<VelouraLogin />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;