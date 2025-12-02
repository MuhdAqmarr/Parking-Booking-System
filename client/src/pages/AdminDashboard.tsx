import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard,
    Calendar,
    MapPin,
    AlertCircle,
    Users,
    Settings,
    Menu,
    X,
    LogOut,
    Car,
    DollarSign,
    CheckCircle,
    Loader2,
    FileText,
    CreditCard,
    Clock,
    Shield
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchWithAuth } from '../utils/api';

// Import Views
import FacultiesView from '../components/admin/FacultiesView';
import UsersView from '../components/admin/UsersView';
import ZonesView from '../components/admin/ZonesView';
import LotsView from '../components/admin/LotsView';
import VehiclesView from '../components/admin/VehiclesView';
import PermitsView from '../components/admin/PermitsView';
import ReservationsView from '../components/admin/ReservationsView';
import SessionsView from '../components/admin/SessionsView';
import FinesView from '../components/admin/FinesView';
import PaymentsView from '../components/admin/PaymentsView';
import ReportsView from '../components/admin/ReportsView';
import SettingsView from '../components/admin/SettingsView';

const AdminDashboard: React.FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [stats, setStats] = useState<any>(null);
    const [activities, setActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/admin/login');
    };

    useEffect(() => {
        if (activeTab === 'dashboard') {
            const loadDashboardData = async () => {
                try {
                    setLoading(true);
                    const [statsData, activityData] = await Promise.all([
                        fetchWithAuth('/api/admin/stats'),
                        fetchWithAuth('/api/admin/activity')
                    ]);
                    setStats(statsData);
                    setActivities(activityData);
                } catch (error) {
                    console.error('Failed to load dashboard data', error);
                } finally {
                    setLoading(false);
                }
            };
            loadDashboardData();
        }
    }, [activeTab]);

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'faculties', label: 'Faculties', icon: FileText },
        { id: 'users', label: 'Campus Users', icon: Users },
        { id: 'zones', label: 'Parking Zones', icon: MapPin },
        { id: 'lots', label: 'Parking Lots', icon: MapPin },
        { id: 'vehicles', label: 'Vehicles', icon: Car },
        { id: 'permits', label: 'Permits', icon: Shield },
        { id: 'reservations', label: 'Reservations', icon: Calendar },
        { id: 'sessions', label: 'Sessions', icon: Clock },
        { id: 'fines', label: 'Fines', icon: AlertCircle },
        { id: 'payments', label: 'Payments', icon: CreditCard },
        { id: 'reports', label: 'Reports', icon: FileText },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    const DashboardView = () => (
        <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-8">Dashboard Overview</h1>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-cyan-600" />
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-gradient-to-br from-blue-50/90 to-blue-100/50 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-blue-200 flex items-center space-x-4 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30"><MapPin className="w-6 h-6" /></div>
                            <div><p className="text-sm text-blue-600 font-medium">Total Spaces</p><h3 className="text-2xl font-bold text-gray-900">{stats?.totalSpaces || 0}</h3></div>
                        </div>
                        <div className="bg-gradient-to-br from-cyan-50/90 to-cyan-100/50 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-cyan-200 flex items-center space-x-4 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                            <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 text-white shadow-lg shadow-cyan-500/30"><Car className="w-6 h-6" /></div>
                            <div><p className="text-sm text-cyan-600 font-medium">Occupied</p><h3 className="text-2xl font-bold text-gray-900">{stats?.occupiedSpaces || 0}</h3></div>
                        </div>
                        <div className="bg-gradient-to-br from-green-50/90 to-green-100/50 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-green-200 flex items-center space-x-4 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                            <div className="p-4 rounded-xl bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30"><DollarSign className="w-6 h-6" /></div>
                            <div><p className="text-sm text-green-600 font-medium">Revenue Today</p><h3 className="text-2xl font-bold text-gray-900">RM{stats?.revenue || 0}</h3></div>
                        </div>
                        <div className="bg-gradient-to-br from-red-50/90 to-red-100/50 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-red-200 flex items-center space-x-4 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                            <div className="p-4 rounded-xl bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30"><AlertCircle className="w-6 h-6" /></div>
                            <div><p className="text-sm text-red-600 font-medium">Active Fines</p><h3 className="text-2xl font-bold text-gray-900">{stats?.activeFines || 0}</h3></div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
                        </div>
                        <div className="divide-y divide-gray-200">
                            {activities.map((activity) => (
                                <div key={activity.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center space-x-4">
                                        <div className="bg-green-100 p-2 rounded-full">
                                            <CheckCircle className="w-5 h-5 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                                            <p className="text-xs text-gray-500">{activity.detail}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs text-gray-400">
                                        {new Date(activity.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            ))}
                            {activities.length === 0 && (
                                <div className="px-6 py-4 text-center text-gray-500">No recent activity</div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'faculties': return <FacultiesView />;
            case 'users': return <UsersView />;
            case 'zones': return <ZonesView />;
            case 'lots': return <LotsView />;
            case 'vehicles': return <VehiclesView />;
            case 'permits': return <PermitsView />;
            case 'reservations': return <ReservationsView />;
            case 'sessions': return <SessionsView />;
            case 'fines': return <FinesView />;
            case 'payments': return <PaymentsView />;
            case 'reports': return <ReportsView />;
            case 'settings': return <SettingsView />;
            case 'dashboard':
            default: return <DashboardView />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="h-full flex flex-col">
                    <div className="h-16 flex items-center px-6 border-b border-gray-200">
                        <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-lg flex items-center justify-center text-white font-bold mr-3">
                            P
                        </div>
                        <span className="text-xl font-bold text-gray-900">Admin Panel</span>
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className="ml-auto lg:hidden p-1 text-gray-500"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                        {menuItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    setActiveTab(item.id);
                                    setIsSidebarOpen(false);
                                }}
                                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors ${activeTab === item.id
                                    ? 'bg-cyan-50 text-cyan-700'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <item.icon className={`w-5 h-5 mr-3 ${activeTab === item.id ? 'text-cyan-600' : 'text-gray-400'
                                    }`} />
                                {item.label}
                            </button>
                        ))}
                    </nav>

                    <div className="p-4 border-t border-gray-200">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center px-4 py-3 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 transition-colors"
                        >
                            <LogOut className="w-5 h-5 mr-3" />
                            Logout
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
                    <button
                        onClick={toggleSidebar}
                        className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <div className="flex items-center space-x-4 ml-auto">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-700 font-bold">
                                A
                            </div>
                            <span className="text-sm font-medium text-gray-700 hidden sm:block">Administrator</span>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;
