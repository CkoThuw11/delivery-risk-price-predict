import { useState } from "react";
import Input from "../components/ui/Input";
import { useNavigate } from "react-router-dom";

const BACKEND_URL = "https://testproject.free.beeceptor.com"

function SignupPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ 
    firstName: "", 
    lastName: "", 
    email: "", 
    username: "", 
    password: "", 
    repeatPassword: "" 
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      setErrors({});

      if (!formData.firstName.trim()) {
        throw Error("First name is required");
      }
      if (!formData.lastName.trim()) {
        throw Error("Last name is required");
      }
      if (!formData.email.trim()) {
        throw Error("Email is required");
      }
      if (!formData.username.trim()) {
        throw Error("Username is required");
      }
      if (formData.password.length <= 3) {
        throw Error("Password must be at least 3 characters");
      }
      if (formData.password !== formData.repeatPassword) {
        throw Error("Passwords do not match");
      }

      console.log("Submitting signup");
      
      const { repeatPassword, ...apiData } = formData;
      
      const response = await fetch(BACKEND_URL + "/signup", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(apiData)
      });

      const data = await response.json();
      navigate("/mainpage");
      
    } catch (error) {
      console.error("Error signing up: " + error);
      const errorMessage = error.message;
      let fieldName = "";


      if (errorMessage.includes("First name")) fieldName = "firstName";
      else if (errorMessage.includes("Last name")) fieldName = "lastName";
      else if (errorMessage.includes("Email")) fieldName = "email";
      else if (errorMessage.includes("Username")) fieldName = "username";
      else if (errorMessage.includes("Password must be")) fieldName = "password";
      else if (errorMessage.includes("Passwords do not match")) fieldName = "repeatPassword";

      if (fieldName) {
        setErrors({ [fieldName]: errorMessage });
      }
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Section */}
      <div className="flex-1 bg-accent-1 flex flex-col justify-center items-center p-8">
        <h2 className="text-8xl font-bold color-primary-2 max-w-125 text-center">Welcome<br />Back!</h2>
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
          <h2 className="text-4xl self-center font-bold color-primary-1 mb-8">Sign up</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* First Name & Last Name */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold color-primary-1 mb-3">
                  First Name
                </label>
                <Input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="First Name"
                  className={`w-full px-4 py-2 border rounded-lg bg-gray-100 text-black ${
                    errors.firstName ? 'border-red-500' : ''
                  }`}
                />
                {errors.firstName && (
                  <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-bold color-primary-1 mb-3">
                  Last Name
                </label>
                <Input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Last Name"
                  className={`w-full px-4 py-2 border rounded-lg bg-gray-100 text-black ${
                    errors.lastName ? 'border-red-500' : ''
                  }`}
                />
                {errors.lastName && (
                  <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-sm font-bold color-primary-1 mb-3">
                Email Address
              </label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email Address"
                className={`w-full px-4 py-2 border rounded-lg bg-gray-100 text-black ${
                  errors.email ? 'border-red-500' : ''
                }`}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* User Name */}
            <div>
              <label className="block text-sm font-bold color-primary-1 mb-3">
                User Name
              </label>
              <Input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="User Name"
                className={`w-full px-4 py-2 border rounded-lg bg-gray-100 text-black ${
                  errors.username ? 'border-red-500' : ''
                }`}
              />
              {errors.username && (
                <p className="text-red-500 text-xs mt-1">{errors.username}</p>
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
                placeholder="Password"
                className={`w-full px-4 py-2 border rounded-lg bg-gray-100 focus:outline-none text-black ${
                  errors.password ? 'border-red-500' : ''
                }`}
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            {/* Repeat Password */}
            <div>
              <label className="block text-sm font-bold color-primary-1 mb-3">
                Repeat Password
              </label>
              <input
                type="password"
                name="repeatPassword"
                value={formData.repeatPassword}
                onChange={handleChange}
                placeholder="Repeat Password"
                className={`w-full px-4 py-2 border rounded-lg bg-gray-100 focus:outline-none text-black ${
                  errors.repeatPassword ? 'border-red-500' : ''
                }`}
              />
              {errors.repeatPassword && (
                <p className="text-red-500 text-xs mt-1">{errors.repeatPassword}</p>
              )}
            </div>

            {/* Sign Up Button */}
            <button
              type="submit"
              className="w-full bg-secondary-1 color-primary-2 py-3 rounded-lg text-lg font-semibold transition hover-bg-color-primary-1"
            >
              Sign up
            </button>
          </form>
          
          {/* Login Link */}
          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <a href="#" className="color-secondary-1 font-medium hover:underline hover-color-primary-1" onClick={() => navigate("/login")}>
              Login Now
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;