import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Register from "../pages/Register";
import Login from "../pages/Login";
import MainPage from "../pages/Main";
import PredictingPage from "../pages/Predicting";
import ProtectedRoute from "./ProtectedRoute";
import StatisticsDetail from "../pages/StatisticsDetail";
function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route
          path="/mainpage"
          element={
            <ProtectedRoute>
              <MainPage />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/statistics-detail" element={<StatisticsDetail />} />
        <Route path="/predicting" element={<PredictingPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
