import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2"; // ✅ Import SweetAlert2
import axios from "axios"; // ✅ For backend login call

const LoginPage = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = () => {
    navigate("/users");
  };

  // ✅ Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:5116/auth/login", {
        email,
        password,
      });

      // ✅ Show success alert
      Swal.fire({
        icon: "success",
        title: "Login Successful!",
        text: "Welcome back!",
        timer: 2000,
        showConfirmButton: false,
      });

      // ✅ Store JWT token (optional)
      localStorage.setItem("token", response.data.token);

      // ✅ Redirect to dashboard
      setTimeout(() => {
        navigate("/admin");
      }, 2000);
    } catch (error) {
      // ✅ Show error alert
      Swal.fire({
        icon: "error",
        title: "Login Failed!",
        text:
          error.response?.data?.message ||
          "Invalid email or password. Please try again.",
      });
    }
  };

  return (
    <div className="relative min-h-screen transition-colors duration-500 bg-gradient-to-r from-purple-100 via-pink-100 to-blue-100">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute bg-blue-400 rounded-full -top-40 -right-40 w-80 h-80 blur-3xl opacity-20 animate-pulse"></div>
        <div
          className="absolute bg-purple-400 rounded-full -bottom-40 -left-40 w-80 h-80 blur-3xl opacity-20 animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute bg-pink-400 rounded-full top-1/2 left-1/2 w-96 h-96 blur-3xl opacity-10 animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="relative flex items-center justify-center min-h-screen px-4">
        <div className="relative w-full max-w-md p-8 border shadow-2xl bg-white/30 backdrop-blur-sm border-white/30 rounded-3xl">
          <h2 className="mb-6 text-3xl font-bold text-center text-gray-900">
            Login
          </h2>

          {/* ✅ Login Form */}
          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-2 mt-1 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-2 mt-1 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full px-6 py-2 mt-2 font-semibold text-white transition rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:scale-105"
            >
              Login
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">Don't have an account?</p>
            <button
              onClick={handleSignup}
              className="w-full px-6 py-2 mt-2 font-semibold text-white transition rounded-xl bg-gradient-to-r from-pink-500 to-red-500 hover:scale-105"
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
