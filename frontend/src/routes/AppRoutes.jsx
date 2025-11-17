import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Register from "../pages/Register";
import Login from "../pages/Login";
import Overview from "../pages/Overview";
import PredictingPage from "../pages/Predicting";
import ProtectedRoute from "./ProtectedRoute";
import StatisticsDetail from "../pages/StatisticsDetail";
import MainLayout from "../components/layouts/MainLayout";
import TrainerPredictingPage from "../pages/PredictingTrainer";
import MLManagementPage from "../pages/Training"
import CRUDPage from "../pages/Crud"
function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Protected Routes */}
        <Route
          element={
            <ProtectedRoute allowedRoles={["admin", "user", "trainer"]}>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Navigate to="/mainpage" replace />} />

          {/* Admin only */}
          <Route
            path="/mainpage"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Overview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/statistics/:category"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <StatisticsDetail />
              </ProtectedRoute>
            }
          />

          {/* Admin + User */}
          <Route
            path="/predicting"
            element={
              <ProtectedRoute allowedRoles={["admin", "user"]}>
                <PredictingPage />
              </ProtectedRoute>
            }
          />

          {/* Trainer only */}
          <Route
            path="/tableview"
            element={
              <ProtectedRoute allowedRoles={["trainer"]}>
                <CRUDPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/training-trainer"
            element={
              <ProtectedRoute allowedRoles={["trainer"]}>
                <TrainerPredictingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/training"
            element={
              <ProtectedRoute allowedRoles={["trainer"]}>
                < MLManagementPage/>
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
