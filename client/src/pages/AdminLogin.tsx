import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { Lock, User, Loader2 } from 'lucide-react';

const AdminLogin: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ username?: string; password?: string }>({});
    const navigate = useNavigate();

    const validate = () => {
        const newErrors: { username?: string; password?: string } = {};
        if (!username.trim()) {
            newErrors.username = 'Username is required';
        } else if (username.length < 3) {
            newErrors.username = 'Username must be at least 3 characters';
        }

        if (!password) {
            newErrors.password = 'Password is required';
        } else if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        try {
            const res = await axios.post('/api/auth/login', { username, password });
            localStorage.setItem('token', res.data.token);
            toast.success('Login successful');
            setTimeout(() => navigate('/admin'), 500);
        } catch (err: any) {
            const msg = err.response?.data?.error || 'Login failed. Please check your credentials.';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <Toaster position="top-center" />
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
                <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl mx-auto flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-cyan-500/30 mb-4">
                        P
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Admin Portal</h2>
                    <p className="text-gray-500 text-sm mt-2">Sign in to manage the parking system</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all ${errors.username ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'}`}
                                placeholder="Enter your username"
                                value={username}
                                onChange={(e) => {
                                    setUsername(e.target.value);
                                    if (errors.username) setErrors({ ...errors, username: undefined });
                                }}
                            />
                        </div>
                        {errors.username && <p className="text-red-500 text-xs mt-1 ml-1">{errors.username}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="password"
                                className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all ${errors.password ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'}`}
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    if (errors.password) setErrors({ ...errors, password: undefined });
                                }}
                            />
                        </div>
                        {errors.password && <p className="text-red-500 text-xs mt-1 ml-1">{errors.password}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-2.5 rounded-xl hover:shadow-lg hover:shadow-cyan-500/30 transition-all duration-200 font-medium flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Signing in...
                            </>
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
