// src/pages/UserManagementPage.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import Navbar from "../components/Navbar";

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    EmployeeId: "",
    FirstName: "",
    LastName: "",
    PhoneNumber: "",
    Email: "",
    Password: "",
    ConfirmPassword: "",
    Role: "StationOperator",
    IsActive: true,
  });

  // Load users from backend
  useEffect(() => {
    axios
      .get("http://localhost:5116/users")
      .then((res) => setUsers(res.data))
      .catch((err) => console.error(err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.Password !== form.ConfirmPassword) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Passwords do not match!",
      });
      return;
    }

    try {
      const res = await axios.post("http://localhost:5116/users/register", {
        employeeId: form.EmployeeId,
        firstName: form.FirstName,
        lastName: form.LastName,
        phoneNumber: form.PhoneNumber,
        email: form.Email,
        password: form.Password,
        role: form.Role,
        isActive: form.IsActive,
      });

      setUsers([...users, res.data]);

      Swal.fire({
        icon: "success",
        title: "User Registered!",
        text: `${form.FirstName} ${form.LastName} has been added successfully.`,
        showConfirmButton: false,
        timer: 2000,
      });

      setForm({
        EmployeeId: "",
        FirstName: "",
        LastName: "",
        PhoneNumber: "",
        Email: "",
        Password: "",
        ConfirmPassword: "",
        Role: "StationOperator",
        IsActive: true,
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Registration Failed",
        text: "Something went wrong while creating the user.",
      });
    }
  };

  return (
    <div className="relative min-h-screen transition-colors duration-500 bg-gradient-to-r from-purple-100 via-pink-100 to-blue-100">
      <Navbar />

      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute bg-blue-400 rounded-full -top-40 -right-40 w-80 h-80 blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bg-purple-400 rounded-full -bottom-40 -left-40 w-80 h-80 blur-3xl opacity-20 animate-pulse" style={{ animationDelay: "1s" }}></div>
        <div className="absolute bg-pink-400 rounded-full top-1/2 left-1/2 w-96 h-96 blur-3xl opacity-10 animate-pulse" style={{ animationDelay: "2s" }}></div>
      </div>

      <div className="relative max-w-lg px-4 pt-24 mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold text-gray-900">
            User{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
              Management
            </span>
          </h1>
          <p className="text-lg text-gray-600">Fill the form to add a new user</p>
        </div>

        {/* User Form Card */}
        <div className="p-8 border shadow-2xl bg-white/30 backdrop-blur-sm border-white/30 rounded-3xl">
          <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
            <input
              type="text"
              placeholder="Employee ID"
              value={form.EmployeeId}
              onChange={(e) => setForm({ ...form, EmployeeId: e.target.value })}
              className="p-3 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="text"
              placeholder="First Name"
              value={form.FirstName}
              onChange={(e) => setForm({ ...form, FirstName: e.target.value })}
              className="p-3 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="text"
              placeholder="Last Name"
              value={form.LastName}
              onChange={(e) => setForm({ ...form, LastName: e.target.value })}
              className="p-3 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="text"
              placeholder="Phone Number"
              value={form.PhoneNumber}
              onChange={(e) => setForm({ ...form, PhoneNumber: e.target.value })}
              className="p-3 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={form.Email}
              onChange={(e) => setForm({ ...form, Email: e.target.value })}
              className="p-3 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={form.Password}
              onChange={(e) => setForm({ ...form, Password: e.target.value })}
              className="p-3 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={form.ConfirmPassword}
              onChange={(e) => setForm({ ...form, ConfirmPassword: e.target.value })}
              className="p-3 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <select
              value={form.Role}
              onChange={(e) => setForm({ ...form, Role: e.target.value })}
              className="p-3 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Backoffice">Backoffice</option>
              <option value="StationOperator">Station Operator</option>
            </select>

            <button
              type="submit"
              className="w-full px-6 py-3 mt-4 font-semibold text-white transition rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:scale-105"
            >
              Add User
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
