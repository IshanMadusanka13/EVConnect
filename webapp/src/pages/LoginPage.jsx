import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { ThemeContext } from '../contexts/ThemeContext';
import api from '../utils/api';
import { Lock, Mail, ArrowRight } from 'lucide-react';

const LoginPage = () => {
    const { darkMode, getColor } = useContext(ThemeContext);
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            setError('Please enter both email and password');
            return;
        }

        setLoading(true);
        try {
            const res = await api.login({ email, password });
            const token = res?.token || res?.data?.token || null;
            if (token) {
                localStorage.setItem('token', token);
                if (res.user) localStorage.setItem('user', JSON.stringify(res.user));
                navigate('/profile');
            } else if (res?.message) {
                setError(res.message);
            } else {
                setError('Login failed: unexpected server response');
            }
        } catch (err) {
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`min-h-screen ${getColor('background.primary')} transition-colors duration-500`}>
            <Navbar />

            <div className="flex items-center justify-center pt-24 px-4">
                <div className={`max-w-md w-full rounded-2xl p-8 border ${getColor('border.primary')} ${getColor('background.card')} shadow-xl`}>
                    <div className="mb-6 text-center">
                        <h2 className={`text-3xl font-bold mb-2 ${getColor('text.primary')}`}>Welcome back</h2>
                        <p className={`${getColor('text.secondary')}`}>Sign in to manage your EV charging bookings</p>
                    </div>

                    {error && (
                        <div className={`mb-4 p-3 rounded-lg border ${getColor('border.primary')} bg-red-50 dark:bg-red-900/20 text-red-700`}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <label className="block">
                            <span className={`text-sm font-semibold ${getColor('text.tertiary')}`}>Email</span>
                            <div className="relative mt-2">
                                <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5`} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={`input pl-12`}
                                    placeholder="you@example.com"
                                />
                            </div>
                        </label>

                        <label className="block">
                            <span className={`text-sm font-semibold ${getColor('text.tertiary')}`}>Password</span>
                            <div className="relative mt-2">
                                <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5`} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={`input pl-12`}
                                    placeholder="Your password"
                                />
                            </div>
                        </label>

                        <div className="flex items-center justify-between text-sm">
                            <label className="inline-flex items-center gap-2">
                                <input type="checkbox" className="rounded" />
                                <span className={`${getColor('text.secondary')}`}>Remember me</span>
                            </label>
                            <button type="button" className={`text-sm ${getColor('text.secondary')} hover:underline`}>Forgot password?</button>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold transition-all ${loading ? 'opacity-60 cursor-wait' : 'hover:shadow-lg'}`}
                        >
                            {loading ? 'Signing in...' : (
                                <>
                                    Sign in <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
