import React, { useState } from "react";
import Input from "../components/ui/Input";
import { useNavigate } from "react-router-dom";

function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ user_or_email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({...prev, [name]: ""}));
    }
    if (loginError) setLoginError("");
  };
  
  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      setErrors({})
      if (!formData.user_or_email.trim()) {
        throw Error("Username/Email is required");
      }
      if (formData.password.length <= 3) {
        throw Error("Password must be at least 3 characters");
      }

      console.log("Submitting...")
      const response = await fetch("http://127.0.0.1:8000/user/login/", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)});

      const data = await response.json();
      
      if (response.status === 200) {
        console.log("User information: ", data);
        const token = data.token;
        localStorage.setItem("authToken", token);
        navigate("/mainpage");
      }
      else{
        console.log("Error");
        setLoginError(data?.detail || "Login failed. Please check your inputs.");
      }
    } catch (error) {
      console.error("Error fetching data: " + error)
      const errorMessage = error.message;
      let fieldName = "";
      if (errorMessage.includes("Username/Email")) fieldName = "user_or_email";
      else fieldName = "password";

      if (fieldName) {
        setErrors({[fieldName]: errorMessage});
      }
    }
    
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Section */}
      <div className="flex-1 bg-accent-1 flex flex-col justify-center items-center p-8">
        <h2 className="text-8xl font-bold color-primary-2 max-w-125">Welcome Back!</h2>
        <div className="mt-5">
          {/* Placeholder for image */}
          <img
            src="src/assets/img/logging-page-banner.png"
            alt="illustration"
            className="w-full"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex-1 flex justify-center items-center bg-white p-8">
        <div className="w-full max-w-md flex-col flex justify-center">
          {loginError && (
            <p className="text-red-500 text-sm mt-2 text-center">{loginError}</p>
          )}
          <h2 className="text-7xl self-center font-bold color-primary-1 mb-16">Login</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-bold color-primary-1 mb-3">
                Email/User Name
              </label>
              <Input
                type="user_or_email"
                name="user_or_email"
                value={formData.user_or_email}
                onChange={handleChange}
                placeholder="Enter your username/email"
                className={`w-full px-4 py-2 border rounded-lg bg-gray-100 text-black ${errors.user_or_email ? 'border-red-500': ''} `}
              />
              {errors.user_or_email && (
                <p className ="text-red-500 text-xs mt-1">{errors.user_or_email}</p>
              )}
            </div>
            {/* Password */}
            <div>
              <label className="block text-sm font-bold color-primary-1 mb-3">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className={`w-full px-4 py-2 border rounded-lg bg-gray-100 text-black ${errors.password ? 'border-red-500': ''} `}
                />
                {errors.password && (
                  <p className ="text-red-500 text-xs mt-1">{errors.password}</p>
                )}
            </div>
            {/* Forgot Password */}
            <div className="text-right">
              <a href="#" className="color-secondary-1 text-sm hover:color-primary-1 hover-color-primary-1">
                Forgot Password?
              </a>
            </div>
            {/* Button */}
            <button
              type="submit"
              className="w-full bg-secondary-1 color-primary-2 py-3 rounded-lg text-lg font-semibold transition hover-bg-color-primary-1"
            >
              Login
            </button>
          </form>
          {/* Register */}
          <p className="mt-6 text-center text-sm text-gray-600">
            Don’t have an account?{" "}
            <a href="#" className="color-secondary-1 font-medium hover:underline hover-color-primary-1" onClick={(e) => {
              e.preventDefault();
              navigate("/register")}}>
              Register Now
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage
