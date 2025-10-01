import React, { useEffect, useState } from "react";
import axios from "axios";

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    username: "",
    password: "",
    role: "StationOperator",
  });

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/users")
      .then((res) => setUsers(res.data))
      .catch((err) => console.error(err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:5000/api/users/register",
        form
      );
      setUsers([...users, res.data]);
      setForm({ username: "", password: "", role: "StationOperator" });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen py-10 bg-gradient-to-r from-purple-100 via-pink-100 to-blue-100 dark:from-purple-900 dark:via-pink-900 dark:to-blue-900">
      
      {/* Page Header */}
      <h1 className="mb-10 text-3xl font-bold text-gray-700 dark:text-gray-200">
            User <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">Management</span>
          </h1>

      {/* Form Card */}
      <div className="w-full max-w-3xl p-8 mb-12 bg-white shadow-xl dark:bg-gray-800 rounded-2xl">
        <h2 className="mb-6 text-2xl font-semibold text-gray-700 dark:text-gray-200">
          Add New User
        </h2>
        <form
          onSubmit={handleSubmit}
          className="grid items-end grid-cols-1 gap-4 md:grid-cols-4"
        >
          <input
            type="text"
            placeholder="Username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            className="p-3 border border-gray-300 rounded-lg dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="p-3 border border-gray-300 rounded-lg dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
            required
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="p-3 border border-gray-300 rounded-lg dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
            required
          />
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="p-3 border border-gray-300 rounded-lg dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="Backoffice">Backoffice</option>
            <option value="StationOperator">Station Operator</option>
          </select>
          <button
            type="submit"
            className="px-6 py-3 text-white transition-all transform rounded-lg bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 hover:scale-105"
          >
            Add
          </button>
        </form>
      </div>

      {/* User List Card */}
      <div className="w-full max-w-3xl p-8 bg-white shadow-xl dark:bg-gray-800 rounded-2xl">
        <h2 className="mb-6 text-2xl font-semibold text-gray-700 dark:text-gray-200">
          Registered Users
        </h2>
        <ul className="space-y-4">
          {users.map((user) => (
            <li
              key={user._id}
              className="flex items-center justify-between p-4 transition-transform shadow-md rounded-xl bg-gradient-to-r from-purple-50 via-pink-50 to-blue-50 dark:from-purple-700 dark:via-pink-700 dark:to-blue-700 hover:scale-105"
            >
              <span className="font-medium text-gray-800 dark:text-gray-100">
                {user.username}
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
    </div>
  );
}
