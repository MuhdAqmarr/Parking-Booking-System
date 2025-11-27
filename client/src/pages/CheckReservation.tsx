import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Ticket, Car, Loader2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const CheckReservation: React.FC = () => {
    const [code, setCode] = useState('');
    const [plate, setPlate] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleCodeSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (code.trim()) {
            navigate(`/ticket/${code.trim()}`);
        }
    };

    const handlePlateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!plate.trim()) return;

        setLoading(true);
        try {
            const res = await axios.post('/api/public/find-reservation', { plateNum: plate.trim().toUpperCase() });
            navigate(`/ticket/${res.data.proofCode}`);
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Reservation not found');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-cyan-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-cyan-600">
                        <Ticket className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Find Your Reservation</h1>
                    <p className="text-gray-500 mt-2">View your ticket by code or vehicle plate.</p>
                </div>

                <div className="space-y-8">
                    {/* Option 1: Code */}
                    <form onSubmit={handleCodeSubmit}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Option 1: Reservation Code</label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all uppercase placeholder-gray-400"
                                    placeholder="e.g. A1B2C3D4"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={!code.trim()}
                                className="bg-cyan-600 text-white px-6 rounded-xl font-semibold hover:bg-cyan-700 transition-colors shadow-lg shadow-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Go
                            </button>
                        </div>
                    </form>

                    <div className="relative flex items-center justify-center">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <span className="relative bg-white px-4 text-sm text-gray-400 font-medium">OR</span>
                    </div>

                    {/* Option 2: Plate */}
                    <form onSubmit={handlePlateSubmit}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Option 2: Vehicle Plate Number</label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Car className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    value={plate}
                                    onChange={(e) => setPlate(e.target.value.toUpperCase())}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all uppercase placeholder-gray-400"
                                    placeholder="e.g. ABC1234"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={!plate.trim() || loading}
                                className="bg-purple-600 text-white px-6 rounded-xl font-semibold hover:bg-purple-700 transition-colors shadow-lg shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[80px]"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Find'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CheckReservation;
