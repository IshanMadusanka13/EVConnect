// src/pages/UserManagementPage.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

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
    <div className="flex items-center justify-center min-h-screen p-6 bg-gradient-to-r from-purple-100 via-pink-100 to-blue-100">
      <div className="w-full max-w-lg p-8 border shadow-2xl rounded-2xl bg-white/20 backdrop-blur-md border-white/30">
        <h1 className="mb-6 text-3xl font-bold text-center text-black">
          User{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
            Management
          </span>
        </h1>

        {/* Add New User Form */}
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <input
            type="text"
            placeholder="Employee ID"
            value={form.EmployeeId}
            onChange={(e) => setForm({ ...form, EmployeeId: e.target.value })}
            className="p-3 text-black placeholder-black rounded-lg bg-white/30 focus:outline-none focus:ring-2 focus:ring-pink-300"
            required
          />

          <input
            type="text"
            placeholder="First Name"
            value={form.FirstName}
            onChange={(e) => setForm({ ...form, FirstName: e.target.value })}
            className="p-3 text-black placeholder-black rounded-lg bg-white/30 focus:outline-none focus:ring-2 focus:ring-pink-300"
            required
          />

          <input
            type="text"
            placeholder="Last Name"
            value={form.LastName}
            onChange={(e) => setForm({ ...form, LastName: e.target.value })}
            className="p-3 text-black placeholder-black rounded-lg bg-white/30 focus:outline-none focus:ring-2 focus:ring-pink-300"
            required
          />

          <input
            type="text"
            placeholder="Phone Number"
            value={form.PhoneNumber}
            onChange={(e) => setForm({ ...form, PhoneNumber: e.target.value })}
            className="p-3 text-black placeholder-black rounded-lg bg-white/30 focus:outline-none focus:ring-2 focus:ring-pink-300"
            required
          />

          <input
            type="email"
            placeholder="Email"
            value={form.Email}
            onChange={(e) => setForm({ ...form, Email: e.target.value })}
            className="p-3 text-black placeholder-black rounded-lg bg-white/30 focus:outline-none focus:ring-2 focus:ring-pink-300"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={form.Password}
            onChange={(e) => setForm({ ...form, Password: e.target.value })}
            className="p-3 text-black placeholder-black rounded-lg bg-white/30 focus:outline-none focus:ring-2 focus:ring-pink-300"
            required
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={form.ConfirmPassword}
            onChange={(e) =>
              setForm({ ...form, ConfirmPassword: e.target.value })
            }
            className="p-3 text-black placeholder-black rounded-lg bg-white/30 focus:outline-none focus:ring-2 focus:ring-pink-300"
            required
          />

          <select
            value={form.Role}
            onChange={(e) => setForm({ ...form, Role: e.target.value })}
            className="p-3 text-black rounded-lg bg-white/30 focus:outline-none focus:ring-2 focus:ring-pink-300"
          >
            <option value="Backoffice" className="text-gray-900">
              Backoffice
            </option>
            <option value="StationOperator" className="text-gray-900">
              Station Operator
            </option>
          </select>

          <button
            type="submit"
            className="w-full py-3 mt-4 font-semibold text-white transition rounded-lg bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 hover:opacity-90"
          >
            Add User
          </button>
        </form>
      </div>
    </div>
  );
}
