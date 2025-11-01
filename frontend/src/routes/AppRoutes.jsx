import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Register from "../pages/Register";
import Login from "../pages/Login";
import MainPage from "../pages/Main";
import PredictingPage from "../pages/Predicting";
import ProtectedRoute from "./ProtectedRoute";
import StatisticsDetail from "../pages/StatisticsDetail";
import MainLayout from "../components/layouts/MainLayout";
import StatisticsLayout from "../components/layouts/StatisticsLayout";
import PredictingLayout from "../components/layouts/PredictingLayout";
function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Navigate to="/login" />} />
        <Route element={<MainLayout />}>
          <Route element={<StatisticsLayout />}>
            <Route
              path="/mainpage"
              element={
                <ProtectedRoute>
                  <MainPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/statistics-detail"
              element={
                <ProtectedRoute>
                  <StatisticsDetail />
                </ProtectedRoute>
              }
            />
          </Route>
          <Route
            element={
              <ProtectedRoute>
                <PredictingLayout />
              </ProtectedRoute>
            }
          >
            <Route
              path="/predicting"
              element={
                <ProtectedRoute>
                  <PredictingPage />
                </ProtectedRoute>
              }
            />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
