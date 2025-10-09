import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { ThemeContext } from '../contexts/ThemeContext';
import axios from 'axios';
import api from '../utils/api';

const AddUser = () => {
    const { getColor } = useContext(ThemeContext);
    const navigate = useNavigate();
    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        role: 'StationOperator',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!form.firstName || !form.lastName || !form.email || !form.password) {
            setError('Please fill required fields');
            return;
        }

        setLoading(true);
        try {
            console.log({
                firstName: form.firstName,
                lastName: form.lastName,
                email: form.email,
                phoneNumber: form.phoneNumber,
                role: form.role,
                password: form.password,
            });
            const res = await api.register({
                firstName: form.firstName,
                lastName: form.lastName,
                email: form.email,
                phoneNumber: form.phoneNumber,
                role: form.role,
                password: form.password,
            });
            navigate('/profile');
        } catch (err) {
            console.error(err);
            setError('Failed to create user');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`relative min-h-screen transition-colors duration-500 ${getColor('background.primary')}`}>
            <Navbar />
            <Sidebar activePath="/users" />

            <div className="relative flex-1 p-8 ml-80">
                <div className="max-w-2xl mx-auto">
                    <h1 className={`text-3xl font-bold mb-4 ${getColor('text.primary')}`}>Add New User</h1>

                    {error && <div className="mb-4 p-3 rounded bg-red-50 text-red-700">{error}</div>}

                    <form onSubmit={handleSubmit} className={`space-y-4 p-6 rounded-2xl border ${getColor('border.primary')} ${getColor('background.card')}`}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input className="input" placeholder="First name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
                            <input className="input" placeholder="Last name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
                        </div>
                        <input className="input" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                        <input className="input" placeholder="Phone number" value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} />
                        <div>
                            <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                                <option value="StationOperator">Station Operator</option>
                                <option value="Backoffice">Backoffice</option>
                            </select>
                        </div>
                        <input className="input" type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />

                        <div className="flex gap-3">
                            <button type="submit" disabled={loading} className="btn btn-primary">
                                {loading ? 'Creating...' : 'Create User'}
                            </button>
                            <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddUser;
