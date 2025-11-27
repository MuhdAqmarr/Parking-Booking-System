import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../../utils/api';
import { BarChart, PieChart, DollarSign, Users } from 'lucide-react';

const ReportsView: React.FC = () => {
    const [report, setReport] = useState<any>(null);

    useEffect(() => {
        fetchWithAuth('/api/admin/reports')
            .then(setReport)
            .catch(console.error);
    }, []);

    if (!report) return <div>Loading reports...</div>;

    const Card = ({ title, value, sub, icon: Icon, color }: any) => {
        const getThemeStyles = (colorClass: string) => {
            if (colorClass.includes('blue')) return {
                card: 'bg-gradient-to-br from-blue-50/90 to-blue-100/50 border-blue-200',
                icon: 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-500/30',
                text: 'text-blue-600'
            };
            if (colorClass.includes('red')) return {
                card: 'bg-gradient-to-br from-red-50/90 to-red-100/50 border-red-200',
                icon: 'bg-gradient-to-br from-red-500 to-red-600 shadow-red-500/30',
                text: 'text-red-600'
            };
            if (colorClass.includes('green')) return {
                card: 'bg-gradient-to-br from-green-50/90 to-green-100/50 border-green-200',
                icon: 'bg-gradient-to-br from-green-500 to-green-600 shadow-green-500/30',
                text: 'text-green-600'
            };
            if (colorClass.includes('purple')) return {
                card: 'bg-gradient-to-br from-purple-50/90 to-purple-100/50 border-purple-200',
                icon: 'bg-gradient-to-br from-purple-500 to-purple-600 shadow-purple-500/30',
                text: 'text-purple-600'
            };
            return {
                card: 'bg-white border-gray-200',
                icon: 'bg-gray-500',
                text: 'text-gray-500'
            };
        };

        const theme = getThemeStyles(color);

        return (
            <div className={`${theme.card} backdrop-blur-md p-6 rounded-2xl shadow-lg border flex items-center space-x-4 hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}>
                <div className={`p-4 rounded-xl ${theme.icon} text-white shadow-lg`}>
                    <Icon className="w-6 h-6" />
                </div>
                <div>
                    <p className={`text-sm ${theme.text} font-medium`}>{title}</p>
                    <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
                    {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">System Reports</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card
                    title="Occupancy"
                    value={`${report.occupancy.occupied} / ${report.occupancy.total}`}
                    sub={`${((report.occupancy.occupied / report.occupancy.total) * 100).toFixed(1)}% Utilization`}
                    icon={BarChart}
                    color="bg-blue-500"
                />
                <Card
                    title="Fines Status"
                    value={`${report.fines.paid} / ${report.fines.total}`}
                    sub="Paid / Total Issued"
                    icon={PieChart}
                    color="bg-red-500"
                />
                <Card
                    title="Total Revenue"
                    value={`$${report.revenue}`}
                    sub="From Fines & Payments"
                    icon={DollarSign}
                    color="bg-green-500"
                />
                <Card
                    title="Reservations (7 Days)"
                    value={report.reservationsTrend.reduce((acc: number, curr: any) => acc + curr._count.reservationID, 0)}
                    sub="Total Bookings"
                    icon={Users}
                    color="bg-purple-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Reservation Trend</h3>
                    <div className="space-y-2">
                        {report.reservationsTrend.map((item: any) => (
                            <div key={item.reservationDate} className="flex justify-between items-center">
                                <span className="text-gray-600">{new Date(item.reservationDate).toLocaleDateString()}</span>
                                <div className="flex-1 mx-4 bg-gray-100 rounded-full h-2">
                                    <div
                                        className="bg-purple-500 h-2 rounded-full"
                                        style={{ width: `${Math.min(item._count.reservationID * 10, 100)}%` }}
                                    />
                                </div>
                                <span className="font-bold text-gray-900">{item._count.reservationID}</span>
                            </div>
                        ))}
                        {report.reservationsTrend.length === 0 && <p className="text-gray-500">No data available</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportsView;
