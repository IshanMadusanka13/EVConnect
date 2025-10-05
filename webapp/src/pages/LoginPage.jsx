import React from "react";
import { useNavigate } from "react-router-dom";
//import Navbar from "../components/Navbar"; // Optional: include Navbar if needed

const LoginPage = () => {
  const navigate = useNavigate();

  const handleSignup = () => {
    navigate("/users");
  };

  return (
    <div className="relative min-h-screen transition-colors duration-500 bg-gradient-to-r from-purple-100 via-pink-100 to-blue-100">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute bg-blue-400 rounded-full -top-40 -right-40 w-80 h-80 blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bg-purple-400 rounded-full -bottom-40 -left-40 w-80 h-80 blur-3xl opacity-20 animate-pulse" style={{ animationDelay: "1s" }}></div>
        <div className="absolute bg-pink-400 rounded-full top-1/2 left-1/2 w-96 h-96 blur-3xl opacity-10 animate-pulse" style={{ animationDelay: "2s" }}></div>
      </div>

      <div className="relative flex items-center justify-center min-h-screen px-4">
        {/* Optional Navbar */}
        {/* <Navbar /> */}

        <div className="relative w-full max-w-md p-8 border shadow-2xl bg-white/30 backdrop-blur-sm border-white/30 rounded-3xl">
          <h2 className="mb-6 text-3xl font-bold text-center text-gray-900">
            Login
          </h2>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-2 mt-1 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                className="w-full px-4 py-2 mt-1 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
