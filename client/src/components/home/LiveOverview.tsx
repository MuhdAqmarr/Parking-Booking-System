import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2 } from 'lucide-react';

const LiveOverview: React.FC = () => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get('/api/public/overview')
            .then(res => setData(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="py-12 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-600" />
        </div>
    );

    if (!data) return null;

    const StatCard = ({ label, value, sub, color }: any) => (
        <div className={`p-6 rounded-2xl shadow-lg border ${color} bg-white flex flex-col items-center justify-center text-center hover:-translate-y-1 transition-transform duration-300`}>
            <h3 className="text-4xl font-extrabold text-gray-900 mb-1">{value}</h3>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{label}</p>
            {sub && <p className="text-xs text-gray-400 mt-2">{sub}</p>}
        </div>
    );

    return (
        <section className="py-16 bg-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-base text-cyan-600 font-semibold tracking-wide uppercase">Live Status</h2>
                    <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                        Parking Overview
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <StatCard
                        label="Staff Zones"
                        value={`${Math.round(data.staffOccupancy * 100)}%`}
                        sub="Occupancy"
                        color="border-blue-100 bg-gradient-to-br from-blue-50 to-white"
                    />
                    <StatCard
                        label="Student Zones"
                        value={`${Math.round(data.studentOccupancy * 100)}%`}
                        sub="Occupancy"
                        color="border-cyan-100 bg-gradient-to-br from-cyan-50 to-white"
                    />
                    <StatCard
                        label="Visitor Zones"
                        value={`${Math.round(data.visitorOccupancy * 100)}%`}
                        sub="Occupancy"
                        color="border-teal-100 bg-gradient-to-br from-teal-50 to-white"
                    />
                    <StatCard
                        label="Free Lots"
                        value={data.totalFreeLots}
                        sub="Available Now"
                        color="border-green-100 bg-gradient-to-br from-green-50 to-white"
                    />
                </div>
            </div>
        </section>
    );
};

export default LiveOverview;
