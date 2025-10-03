import { BrowserRouter, Routes, Route ,Navigate} from "react-router-dom";
import Register from "../pages/Register";
import Login from "../pages/Login";
import MainPage from "../pages/Main";
import ProtectedRoute from "./ProtectedRoute";
function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route 
        path="/mainpage" 
        element={
          <ProtectedRoute>
            <MainPage/>
          </ProtectedRoute>
        } />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;