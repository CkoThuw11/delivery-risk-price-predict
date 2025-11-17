import {useState } from "react";
import { useNavigate } from "react-router-dom";
import bgImage from "../assets/img/background.png"; 
import { apiFetch } from "../utils/apiFetch";

const Input = ({ className = "", ...props }) => {
  return (
    <input
      {...props}
      className={
        "w-full px-5 py-3 rounded-lg bg-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 " +
        className
      }
    />
  );
};

export default function Login() {
  const [formData, setFormData] = useState({ user_or_email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate()
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    if (loginError) setLoginError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoginError("");

    if (!formData.user_or_email.trim()) {
      setErrors({ user_or_email: "Username/Email is required" });
      return;
    }
    if (formData.password.length <= 3) {
      setErrors({ password: "Password must be at least 4 characters" });
      return;
    }

    try {
      setLoading(true);

      const response = await apiFetch("http://127.0.0.1:8000/user/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("User information: ", data);

        localStorage.setItem("authToken", data.access);
        localStorage.setItem("role", data.user.role);
        localStorage.setItem("refreshToken", data.refresh);

        const role = data.user.role;
          if (role === "user") navigate("/predicting");
          else if (role === "admin") navigate("/mainpage");
          else if (role === "trainer") navigate("/tableview");

        } else {
          setLoginError(data?.detail || "Login failed.");
        }

      } catch (err) {
        console.error(err);
        setLoginError("Something went wrong. Please try again later.");

      } finally {
        setLoading(false);
      }


  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-end bg-cover bg-center font-sans"
      style={{
        backgroundImage: `url(${bgImage})`,
      }}
    >
      {/* Right column*/}
      <div className="w-full md:w-1/2 lg:w-2/5 bg-transparent h-full flex items-center">
        <div className="w-full max-w-md mx-auto p-8 md:p-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Login</h2>

          {loginError && (
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4"
              role="alert"
            >
              <span className="block sm:inline">{loginError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email / Username */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Email/User Name
              </label>
              <Input
                type="text"
                name="user_or_email"
                value={formData.user_or_email}
                onChange={handleChange}
                placeholder="Enter your username or email"
                className={errors.user_or_email ? "ring-2 ring-red-500" : ""}
                aria-invalid={!!errors.user_or_email}
                aria-describedby={errors.user_or_email ? "user-error" : undefined}
              />
              {errors.user_or_email && (
                <p id="user-error" className="text-red-300 text-xs mt-1">
                  {errors.user_or_email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Password
              </label>
              <Input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className={errors.password ? "ring-2 ring-red-500" : ""}
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? "pass-error" : undefined}
              />
              {errors.password && (
                <p id="pass-error" className="text-red-300 text-xs mt-1">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Forgot password */}
            <div className="text-right">
              <a href="#" className="text-sm color-accent-3 hover:text-green-100">
                Forgot Password?
              </a>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-3 text-white py-3 rounded-full text-lg font-semibold transition hover:text-green-100"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm font-bold text-[#CCCCCC]">
            Don’t have an account?{" "}
            <a
              href="#"
              className="font-medium color-accent-3 hover:text-green-100"
              onClick={(e) => {
                e.preventDefault();
                console.log("Navigate to register");
                navigate("/register");
              }}
            >
              Register Now
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
