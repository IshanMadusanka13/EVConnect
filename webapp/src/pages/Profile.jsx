import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { ThemeContext } from "../contexts/ThemeContext";
import { UserCircle, X } from "lucide-react";

const ProfilePage = () => {
  const { darkMode, getColor } = useContext(ThemeContext);
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const userId = "68e2bab51f6a9852b6e0dcee";

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`http://localhost:5116/users/${userId}`);
        setUser(response.data);
        setEditForm({
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          email: response.data.email,
          phoneNumber: response.data.phoneNumber,
          role: response.data.role,
          isActive: response.data.isActive,
        });
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };
    fetchUser();
  }, [userId]);

  const handleUpdate = async () => {
    try {
      await axios.put(`http://localhost:5116/users/${userId}`, editForm);
      setUser(editForm);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) return <div className="mt-20 text-center text-gray-500">Loading user details...</div>;

  return (
    <div className={`relative min-h-screen transition-colors duration-500 ${getColor('background.primary')}`}>
      <Navbar />

      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl opacity-20 ${darkMode ? 'bg-blue-600' : 'bg-blue-400'} animate-pulse`}></div>
        <div className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl opacity-20 ${darkMode ? 'bg-purple-600' : 'bg-purple-400'} animate-pulse`} style={{ animationDelay: '1s' }}></div>
        <div className={`absolute top-1/2 left-1/2 w-96 h-96 rounded-full blur-3xl opacity-10 ${darkMode ? 'bg-pink-600' : 'bg-pink-400'} animate-pulse`} style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative flex flex-col items-center justify-center min-h-screen px-8 py-16">
        <h1 className={`text-4xl font-bold mb-8 ${getColor('text.primary')}`}>
          My Profile
        </h1>

        <div className={`w-full max-w-3xl p-6 bg-white dark:bg-slate-800 shadow-2xl rounded-3xl border ${getColor('border.primary')}`}>
          {/* Edit Mode Toggle */}
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-2xl font-semibold ${getColor('text.primary')}`}>
              {isEditing ? "Edit Profile" : "Profile Details"}
            </h2>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`px-3 py-1 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:scale-105 transition-transform`}
            >
              {isEditing ? "Cancel" : "Edit"}
            </button>
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <input
                type="text"
                placeholder="First Name"
                value={editForm.firstName}
                onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                className="w-full p-3 border rounded-lg"
              />
              <input
                type="text"
                placeholder="Last Name"
                value={editForm.lastName}
                onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                className="w-full p-3 border rounded-lg"
              />
              <input
                type="email"
                placeholder="Email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                className="w-full p-3 border rounded-lg"
              />
              <input
                type="text"
                placeholder="Phone Number"
                value={editForm.phoneNumber}
                onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                className="w-full p-3 border rounded-lg"
              />
              <select
                value={editForm.role}
                onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                className="w-full p-3 border rounded-lg"
              >
                <option value="Backoffice">Backoffice</option>
                <option value="StationOperator">Station Operator</option>
              </select>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editForm.isActive}
                  onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                  id="isActive"
                  className="w-4 h-4"
                />
                <label htmlFor="isActive" className={getColor('text.primary')}>Active</label>
              </div>
              <button
                onClick={handleUpdate}
                className="w-full py-3 mt-4 font-semibold text-white transition-all rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:scale-105"
              >
                Save Changes
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="p-4 space-y-2 rounded-xl bg-slate-50 dark:bg-slate-800">
                <p className={`text-xs ${getColor('text.tertiary')}`}>Full Name</p>
                <p className={`font-semibold text-lg ${getColor('text.primary')}`}>{user.firstName} {user.lastName}</p>
              </div>
              <div className="p-4 space-y-2 rounded-xl bg-slate-50 dark:bg-slate-800">
                <p className={`text-xs ${getColor('text.tertiary')}`}>Email</p>
                <p className={`font-semibold text-lg ${getColor('text.primary')}`}>{user.email}</p>
              </div>
              <div className="p-4 space-y-2 rounded-xl bg-slate-50 dark:bg-slate-800">
                <p className={`text-xs ${getColor('text.tertiary')}`}>Phone Number</p>
                <p className={`font-semibold text-lg ${getColor('text.primary')}`}>{user.phoneNumber}</p>
              </div>
              <div className="p-4 space-y-2 rounded-xl bg-slate-50 dark:bg-slate-800">
                <p className={`text-xs ${getColor('text.tertiary')}`}>Role</p>
                <span
                  className={`inline-block px-4 py-2 rounded-full text-sm font-semibold text-white ${
                    user.role === "Backoffice"
                      ? "bg-gradient-to-r from-red-500 to-pink-500"
                      : "bg-gradient-to-r from-blue-500 to-cyan-500"
                  }`}
                >
                  {user.role}
                </span>
              </div>
              <div className="p-4 space-y-2 rounded-xl bg-slate-50 dark:bg-slate-800">
                <p className={`text-xs ${getColor('text.tertiary')}`}>Status</p>
                <p className={`font-semibold text-lg ${getColor('text.primary')}`}>
                  {user.isActive ? "Active" : "Inactive"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
