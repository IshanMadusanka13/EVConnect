// src/pages/UserManagementPage.jsx
import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import Navbar from "../components/Navbar";
import { ThemeContext } from '../contexts/ThemeContext';
import { useNavigate } from "react-router-dom";

export default function UserManagementPage() {
  const { darkMode, toggleTheme, getColor } = useContext(ThemeContext);

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
      EmployeeId: form.EmployeeId,
      FirstName: form.FirstName,
      LastName: form.LastName,
      PhoneNumber: form.PhoneNumber,
      Email: form.Email,
      Password: form.Password,
      Role: form.Role,
      IsActive: form.IsActive,
    });

    setUsers([...users, res.data]);
    Swal.fire({
      icon: "success",
      title: "User Registered!",
      text: `${form.FirstName} ${form.LastName} has been added successfully.`,
      showConfirmButton: false,
      timer: 2000,
    }).then(() => {
      navigate("/login"); // <-- redirect to login
    });

    setForm({
      employeeId: "",
      firstName: "",
      LastNameastName: "",
      phoneNumber: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "StationOperator",
      isActive: true,
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


  // Icons
  const Users = ({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
  const UserPlus = ({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>;
  const Shield = ({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>;
  const Mail = ({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
  const Phone = ({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>;
  const Key = ({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>;
  const ChevronRight = ({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>;

  return (
    <div className={`min-h-screen transition-colors duration-500 ${getColor('background.primary')}`}>
      <Navbar />

      {/* Dark mode toggle */}
      <div className="fixed z-20 top-6 right-6">
        <button
          onClick={toggleTheme}
          className={`px-6 py-3 text-sm font-semibold rounded-full shadow-lg transition-all duration-300 hover:scale-105 ${
            darkMode
              ? "bg-gradient-to-r from-blue-600 to-purple-700 text-white hover:shadow-blue-500/50"
              : "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-purple-500/40"
          }`}
        >
          {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>
      </div>

      {/* Page Content */}
      <div className="relative px-4 pt-24 pb-16 mx-auto max-w-7xl">
        {/* Breadcrumb & Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <div className={`px-3 py-1 rounded-full ${darkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'} text-sm font-medium`}>
              Dashboard
            </div>
            <ChevronRight className={`w-4 h-4 ${getColor('text.tertiary')}`} />
            <div className={`px-3 py-1 rounded-full ${darkMode ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-700'} text-sm font-medium`}>
              User Management
            </div>
          </div>
          <h1 className={`text-4xl font-bold mb-2 ${getColor('text.primary')}`}>
            User <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">Management</span>
          </h1>
          <p className={`text-lg ${getColor('text.secondary')}`}>
            Create and manage system users with different access levels
          </p>
        </div>

        {/* User Creation Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6 transition-colors duration-500 bg-white shadow-lg dark:bg-slate-800 rounded-2xl">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <input type="text" placeholder="Employee ID" value={form.EmployeeId} onChange={(e)=>setForm({...form,EmployeeId:e.target.value})} className={`px-4 py-3 rounded-xl w-full border-2 ${getColor('border.input')} ${getColor('background.input')} ${getColor('text.primary')}`} required/>
            <input type="text" placeholder="First Name" value={form.FirstName} onChange={(e)=>setForm({...form,FirstName:e.target.value})} className={`px-4 py-3 rounded-xl w-full border-2 ${getColor('border.input')} ${getColor('background.input')} ${getColor('text.primary')}`} required/>
            <input type="text" placeholder="Last Name" value={form.LastName} onChange={(e)=>setForm({...form,LastName:e.target.value})} className={`px-4 py-3 rounded-xl w-full border-2 ${getColor('border.input')} ${getColor('background.input')} ${getColor('text.primary')}`} required/>
            <input type="text" placeholder="Phone Number" value={form.PhoneNumber} onChange={(e)=>setForm({...form,PhoneNumber:e.target.value})} className={`px-4 py-3 rounded-xl w-full border-2 ${getColor('border.input')} ${getColor('background.input')} ${getColor('text.primary')}`} required/>
            <input type="email" placeholder="Email" value={form.Email} onChange={(e)=>setForm({...form,Email:e.target.value})} className={`px-4 py-3 rounded-xl w-half border-2 md:col-span-1 ${getColor('border.input')} ${getColor('background.input')} ${getColor('text.primary')}`} required/>
            <input type="password" placeholder="Password" value={form.Password} onChange={(e)=>setForm({...form,Password:e.target.value})} className={`px-4 py-3 rounded-xl w-full border-2 ${getColor('border.input')} ${getColor('background.input')} ${getColor('text.primary')}`} required/>
            <input type="password" placeholder="Confirm Password" value={form.ConfirmPassword} onChange={(e)=>setForm({...form,ConfirmPassword:e.target.value})} className={`px-4 py-3 rounded-xl w-full border-2 ${getColor('border.input')} ${getColor('background.input')} ${getColor('text.primary')}`} required/>

            {/* Role Selection */}
            <select value={form.Role} onChange={(e)=>setForm({...form,Role:e.target.value})} className={`px-4 py-3 rounded-xl w-full border-2 md:col-span-1 ${getColor('border.input')} ${getColor('background.input')} ${getColor('text.primary')}`}>
              <option value="Backoffice">Backoffice</option>
              <option value="StationOperator">Station Operator</option>
            </select>
          </div>

          <button type="submit" className="flex items-center justify-center gap-2 px-6 py-4 text-lg font-bold text-white transition-all w-50 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:scale-105">
            <UserPlus className="w-5 h-5"/> Create User
          </button>
        </form>
      </div>
    </div>
  );
}
