import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
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
    <div className="flex flex-col items-center min-h-screen py-10 bg-gradient-to-r from-purple-100 via-pink-100 to-blue-100 dark:from-purple-900 dark:via-pink-900 dark:to-blue-900">
      <h1 className="mb-10 text-3xl font-bold text-gray-700 dark:text-gray-200">
        User{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
          Management
        </span>
      </h1>

      {/* Add New User Form */}
      <div className="w-full max-w-3xl p-8 mb-12 bg-white shadow-xl dark:bg-gray-800 rounded-2xl">
        <h2 className="mb-6 text-2xl font-semibold text-gray-700 dark:text-gray-200">
          Add New User
        </h2>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-4 md:grid-cols-4"
        >
          <input
            type="text"
            placeholder="Employee ID"
            value={form.EmployeeId}
            onChange={(e) => setForm({ ...form, EmployeeId: e.target.value })}
            className="p-3 border border-gray-300 rounded-lg dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
            required
          />

          <input
            type="text"
            placeholder="First Name"
            value={form.FirstName}
            onChange={(e) => setForm({ ...form, FirstName: e.target.value })}
            className="p-3 border border-gray-300 rounded-lg dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
            required
          />

          <input
            type="text"
            placeholder="Last Name"
            value={form.LastName}
            onChange={(e) => setForm({ ...form, LastName: e.target.value })}
            className="p-3 border border-gray-300 rounded-lg dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
            required
          />

          <input
            type="text"
            placeholder="Phone Number"
            value={form.PhoneNumber}
            onChange={(e) => setForm({ ...form, PhoneNumber: e.target.value })}
            className="p-3 border border-gray-300 rounded-lg dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
            required
          />

          <input
            type="email"
            placeholder="Email"
            value={form.Email}
            onChange={(e) => setForm({ ...form, Email: e.target.value })}
            className="p-3 border border-gray-300 rounded-lg dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={form.Password}
            onChange={(e) => setForm({ ...form, Password: e.target.value })}
            className="p-3 border border-gray-300 rounded-lg dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
            required
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={form.ConfirmPassword}
            onChange={(e) =>
              setForm({ ...form, ConfirmPassword: e.target.value })
            }
            className="p-3 border border-gray-300 rounded-lg dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
            required
          />

          <select
            value={form.Role}
            onChange={(e) => setForm({ ...form, Role: e.target.value })}
            className="p-3 border border-gray-300 rounded-lg dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="Backoffice">Backoffice</option>
            <option value="StationOperator">Station Operator</option>
          </select>

          <button
            type="submit"
            className="px-6 py-3 text-white transition-all transform rounded-lg bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 hover:scale-105 col-span-full md:col-auto"
          >
            Add
          </button>
        </form>
      </div>

      {/* User List */}
      <div className="w-full max-w-3xl p-8 mb-6 bg-white shadow-xl dark:bg-gray-800 rounded-2xl">
        <h2 className="mb-6 text-2xl font-semibold text-gray-700 dark:text-gray-200">
          Registered Users
        </h2>
        <ul className="space-y-4">
  {users.map((user) => (
    <li
      key={user._id || user.employeeId}  // fallback if _id is not present
      onClick={() => setSelectedUser(user)}
      className="flex items-center justify-between p-4 transition-transform shadow-md cursor-pointer rounded-xl bg-gradient-to-r from-purple-50 via-pink-50 to-blue-50 dark:from-purple-700 dark:via-pink-700 dark:to-blue-700 hover:scale-105"
    >
      <span className="font-medium text-gray-800 dark:text-gray-100">
        {user.firstName} {user.lastName} ({user.employeeId})
      </span>
      <span
        className={`px-4 py-1 rounded-full text-sm font-semibold text-white ${
          user.role === "Backoffice" ? "bg-red-500" : "bg-blue-500"
        }`}
      >
        {user.role}
      </span>
    </li>
  ))}
</ul>

      </div>

      {/* Selected User Details Card */}
      {selectedUser && (
  <div className="w-full max-w-2xl p-6 mt-4 bg-white shadow-lg dark:bg-gray-800 rounded-2xl">
    <h3 className="mb-4 text-xl font-bold text-gray-800 dark:text-gray-100">
      User Details
    </h3>
    <div className="space-y-2 text-gray-700 dark:text-gray-200">
      <p>
        <span className="font-semibold">Name:</span>{" "}
        {selectedUser.firstName} {selectedUser.lastName}
      </p>
      <p>
        <span className="font-semibold">Email:</span> {selectedUser.email}
      </p>
      <p>
        <span className="font-semibold">Phone:</span>{" "}
        {selectedUser.phoneNumber}
      </p>
      <p>
        <span className="font-semibold">Role:</span> {selectedUser.role}
      </p>
    </div>
  </div>
)}

    </div>
  );
}
