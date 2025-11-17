import { useState } from "react";
import { useNavigate } from "react-router-dom";
import bgImage from "../assets/img/background.png"; 
import { apiFetch } from "../utils/apiFetch";

const Input = ({ className = "", ...props }) => (
  <input
    {...props}
    className={
      "w-full px-5 py-3 rounded-lg bg-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 " +
      className
    }
  />
);

export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
    repeatPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [registerError, setRegisterError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    if (registerError) setRegisterError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setRegisterError("");

    if (!formData.firstName.trim()) return setErrors({ firstName: "First name is required" });
    if (!formData.lastName.trim()) return setErrors({ lastName: "Last name is required" });
    if (!formData.email.trim()) return setErrors({ email: "Email is required" });
    if (!formData.username.trim()) return setErrors({ username: "Username is required" });
    if (formData.password.length <= 3)
      return setErrors({ password: "Password must be at least 4 characters" });
    if (formData.password !== formData.repeatPassword)
      return setErrors({ repeatPassword: "Passwords do not match" });

    try {
      setLoading(true);
      const { repeatPassword, ...apiData } = formData;

      const response = await apiFetch("http://127.0.0.1:8000/user/signup/", {
        method: "POST",
        body: JSON.stringify(apiData)
      });

      const data = await response.json();
      if (response.status === 201) {
        console.log("Registered successfully:", data);
        navigate("/login");
      } else {
        setRegisterError(data?.detail || "Registration failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setRegisterError("Something went wrong. Please try again later.");
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
      {/* Signup form */}
      <div className="w-full md:w-1/2 lg:w-2/5 bg-transparent h-full flex items-center">
        <div className="w-full max-w-md mx-auto p-8 md:p-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Create Account
          </h2>
          
          {registerError && (
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4"
              role="alert"
            >
              <span className="block sm:inline">{registerError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  First Name
                </label>
                <Input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="First name"
                  className={errors.firstName ? "ring-2 ring-red-500" : ""}
                />
                {errors.firstName && (
                  <p className="text-red-300 text-xs mt-1">{errors.firstName}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Last Name
                </label>
                <Input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Last name"
                  className={errors.lastName ? "ring-2 ring-red-500" : ""}
                />
                {errors.lastName && (
                  <p className="text-red-300 text-xs mt-1">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Email
              </label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className={errors.email ? "ring-2 ring-red-500" : ""}
              />
              {errors.email && (
                <p className="text-red-300 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Username
              </label>
              <Input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Choose a username"
                className={errors.username ? "ring-2 ring-red-500" : ""}
              />
              {errors.username && (
                <p className="text-red-300 text-xs mt-1">{errors.username}</p>
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
                placeholder="Create a password"
                className={errors.password ? "ring-2 ring-red-500" : ""}
              />
              {errors.password && (
                <p className="text-red-300 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Repeat Password
              </label>
              <Input
                type="password"
                name="repeatPassword"
                value={formData.repeatPassword}
                onChange={handleChange}
                placeholder="Repeat password"
                className={errors.repeatPassword ? "ring-2 ring-red-500" : ""}
              />
              {errors.repeatPassword && (
                <p className="text-red-300 text-xs mt-1">
                  {errors.repeatPassword}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-3 text-white py-3 rounded-full text-lg font-semibold transition hover:text-green-100"
            >
              {loading ? "Signing up..." : "Sign Up"}
            </button>
          </form>

          {/* Login link */}
          <p className="mt-6 text-center text-sm font-bold text-[#CCCCCC]">
            Already have an account?{" "}
            <a
              href="#"
              className="font-medium color-accent-3 hover:text-green-100"
              onClick={(e) => {
                e.preventDefault();
                navigate("/login");
              }}
            >
              Login Now
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
