import { BrowserRouter, Routes, Route ,Navigate} from "react-router-dom";
import Register from "../pages/Register";
import Login from "../pages/Login";
import MainPage from "../pages/Main";
function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/mainpage" element={<MainPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;