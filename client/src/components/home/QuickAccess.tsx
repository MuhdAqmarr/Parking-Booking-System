import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Ticket, AlertCircle, Info } from 'lucide-react';

const QuickAccess: React.FC = () => {
    return (
        <section className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl shadow-xl p-8 sm:p-12 border border-slate-700 overflow-hidden">

                    {/* Content */}
                    <div className="relative z-10">
                        <div className="text-center mb-12">
                            <h2 className="text-base text-cyan-400 font-semibold tracking-wide uppercase">Shortcuts</h2>
                            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-white sm:text-4xl">
                                Quick Access
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <Link to="/reserve" className="group p-6 rounded-2xl border border-white/10 hover:border-cyan-500/50 hover:shadow-lg transition-all duration-300 bg-white/5 backdrop-blur-sm hover:bg-white/10">
                                <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-110 transition-transform">
                                    <Calendar className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-bold text-white">Reserve Parking</h3>
                                <p className="text-sm text-gray-400 mt-2 mb-4">Book a spot for today or upcoming dates.</p>
                                <span className="inline-flex items-center text-sm font-medium text-cyan-400 group-hover:text-cyan-300">
                                    Book Now &rarr;
                                </span>
                            </Link>
                            <Link to="/check-reservation" className="group p-6 rounded-2xl border border-white/10 hover:border-purple-500/50 hover:shadow-lg transition-all duration-300 bg-white/5 backdrop-blur-sm hover:bg-white/10">
                                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center text-purple-400 mb-4 group-hover:scale-110 transition-transform">
                                    <Ticket className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-bold text-white">My Reservation</h3>
                                <p className="text-sm text-gray-400 mt-2 mb-4">View your active ticket or QR code.</p>
                                <span className="inline-flex items-center text-sm font-medium text-purple-400 group-hover:text-purple-300">
                                    View Ticket &rarr;
                                </span>
                            </Link>
                            <Link to="/fines" className="group p-6 rounded-2xl border border-white/10 hover:border-red-500/50 hover:shadow-lg transition-all duration-300 bg-white/5 backdrop-blur-sm hover:bg-white/10">
                                <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center text-red-400 mb-4 group-hover:scale-110 transition-transform">
                                    <AlertCircle className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-bold text-white">Pay Fines</h3>
                                <p className="text-sm text-gray-400 mt-2 mb-4">Check and settle any outstanding fines.</p>
                                <span className="inline-flex items-center text-sm font-medium text-red-400 group-hover:text-red-300">
                                    Pay Now &rarr;
                                </span>
                            </Link>
                            <Link to="/visitor-info" className="group p-6 rounded-2xl border border-white/10 hover:border-green-500/50 hover:shadow-lg transition-all duration-300 bg-white/5 backdrop-blur-sm hover:bg-white/10 cursor-pointer">
                                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center text-green-400 mb-4 group-hover:scale-110 transition-transform">
                                    <Info className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-bold text-white">Visitor Info</h3>
                                <p className="text-sm text-gray-400 mt-2 mb-4">Rates, rules, and campus map.</p>
                                <span className="inline-flex items-center text-sm font-medium text-green-400 group-hover:text-green-300">
                                    Learn More &rarr;
                                </span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default QuickAccess;
