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
                    value={`RM${report.revenue}`}
                    sub="From Fines & Payments"
                    icon={DollarSign}
                    color="bg-green-500"
                />
                <Card
                    title="Reservations (7 Days)"
                    value={report.reservationsTrend.reduce((acc: number, curr: any) => acc + Number(curr.count || curr.COUNT || 0), 0)}
                    sub="Total Bookings"
                    icon={Users}
                    color="bg-purple-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Reservation Trend</h3>
                    <div className="flex gap-4">
                        {/* Y-Axis Labels */}
                        <div className="flex flex-col justify-between h-64 pb-8 pt-4 text-xs text-gray-400 font-medium text-right min-w-[20px]">
                            {(() => {
                                const maxCount = Math.max(...report.reservationsTrend.map((i: any) => Number(i.count || i.COUNT || 0)), 5);
                                return [1, 0.75, 0.5, 0.25, 0].map((ratio, i) => (
                                    <span key={i}>{Math.round(maxCount * ratio)}</span>
                                ));
                            })()}
                        </div>

                        {/* Chart Area */}
                        <div className="flex-1 flex items-stretch justify-between h-64 gap-2 pt-8 pb-2 relative z-0 border-b border-gray-200">
                            {/* Background Grid */}
                            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none z-[-1] pb-8 pt-4">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="w-full border-t border-gray-100 border-dashed"></div>
                                ))}
                            </div>

                            {(() => {
                                const maxCount = Math.max(...report.reservationsTrend.map((i: any) => Number(i.count || i.COUNT || 0)), 5);
                                return report.reservationsTrend.map((item: any) => {
                                    const count = Number(item.count || item.COUNT || 0);
                                    const heightPercentage = (count / maxCount) * 100;

                                    return (
                                        <div key={item.date || item.DATE} className="flex flex-col items-center flex-1 group cursor-pointer">
                                            <div className="w-full flex items-end justify-center flex-1 relative px-1">
                                                <div
                                                    className="w-full max-w-[32px] bg-gradient-to-t from-purple-600 to-indigo-400 rounded-t-lg transition-all duration-500 relative group-hover:shadow-[0_0_20px_rgba(139,92,246,0.5)] group-hover:scale-y-[1.02] origin-bottom group-hover:from-purple-500 group-hover:to-indigo-300"
                                                    style={{ height: `${heightPercentage}%` }}
                                                >
                                                    <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900/95 backdrop-blur-md text-white text-xs font-bold py-1.5 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap z-20 shadow-xl translate-y-2 group-hover:translate-y-0 pointer-events-none border border-white/10">
                                                        {count} Bookings
                                                        <div className="absolute bottom-[-5px] left-1/2 transform -translate-x-1/2 w-2.5 h-2.5 bg-gray-900/95 rotate-45 border-r border-b border-white/10"></div>
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="text-xs text-gray-400 mt-3 font-medium group-hover:text-purple-600 transition-colors">
                                                {new Date(item.date || item.DATE).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
                                            </span>
                                        </div>
                                    );
                                });
                            })()}
                            {report.reservationsTrend.length === 0 && (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 italic">
                                    No data available for the last 7 days
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportsView;
