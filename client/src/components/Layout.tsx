import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Menu, X, Home, Calendar, CreditCard, ShieldCheck } from 'lucide-react';
import logo from '../assets/logo.png';

const Layout: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const closeMenu = () => setIsMenuOpen(false);

    const isActive = (path: string) => location.pathname === path;
    const isHome = location.pathname === '/';
    const isTicket = location.pathname.startsWith('/ticket/');

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 font-sans relative">
            {/* Floating Navbar Container */}
            <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 print:hidden">
                {/* ... header content ... */}
                <header className="w-full max-w-5xl bg-white/30 backdrop-blur-xl border border-white/20 shadow-2xl rounded-full transition-all duration-300">
                    <div className="px-6 sm:px-8">
                        <div className="flex justify-between h-16 items-center">
                            {/* Logo */}
                            <Link to="/" className="flex items-center gap-2" onClick={closeMenu}>
                                <img src={logo} alt="CampusPark Logo" className="w-9 h-9 rounded-full shadow-lg ring-2 ring-white/50 object-cover" />
                                <span className="text-xl font-bold text-gray-900 tracking-tight">
                                    CampusPark
                                </span>
                            </Link>

                            {/* Desktop Navigation */}
                            <nav className="hidden md:flex items-center gap-1">
                                <Link
                                    to="/"
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${isActive('/')
                                        ? 'bg-white text-cyan-600 shadow-md'
                                        : 'text-gray-800 hover:bg-white/50 hover:text-cyan-600'
                                        }`}
                                >
                                    <Home className="w-4 h-4" />
                                    Home
                                </Link>
                                <Link
                                    to="/reserve"
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${isActive('/reserve')
                                        ? 'bg-white text-cyan-600 shadow-md'
                                        : 'text-gray-800 hover:bg-white/50 hover:text-cyan-600'
                                        }`}
                                >
                                    <Calendar className="w-4 h-4" />
                                    Reserve
                                </Link>
                                <Link
                                    to="/fines"
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${isActive('/fines')
                                        ? 'bg-white text-cyan-600 shadow-md'
                                        : 'text-gray-800 hover:bg-white/50 hover:text-cyan-600'
                                        }`}
                                >
                                    <CreditCard className="w-4 h-4" />
                                    Fines
                                </Link>
                                <Link
                                    to="/admin/login"
                                    target='_blank'
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${isActive('/admin/login')
                                        ? 'bg-white text-cyan-600 shadow-md'
                                        : 'text-gray-800 hover:bg-white/50 hover:text-cyan-600'
                                        }`}
                                >
                                    <ShieldCheck className="w-4 h-4" />
                                    Admin
                                </Link>
                            </nav>

                            {/* Mobile Menu Button */}
                            <button
                                onClick={toggleMenu}
                                className="md:hidden p-2 rounded-full hover:bg-white/50 transition-colors"
                                aria-label="Toggle menu"
                            >
                                {isMenuOpen ? (
                                    <X className="w-6 h-6 text-gray-800" />
                                ) : (
                                    <Menu className="w-6 h-6 text-gray-800" />
                                )}
                            </button>
                        </div>
                    </div>
                </header>

                {/* Mobile Navigation Dropdown */}
                {isMenuOpen && (
                    <div className="absolute top-20 left-4 right-4 md:hidden">
                        <div className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-2xl rounded-2xl overflow-hidden p-2 animate-in slide-in-from-top-2 fade-in duration-200">
                            <nav className="flex flex-col space-y-1">
                                <Link
                                    to="/"
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${isActive('/')
                                        ? 'bg-white text-cyan-600 shadow-sm'
                                        : 'text-gray-800 hover:bg-white/50 hover:text-cyan-600'
                                        }`}
                                    onClick={closeMenu}
                                >
                                    <Home className="w-5 h-5" />
                                    Home
                                </Link>
                                <Link
                                    to="/reserve"
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${isActive('/reserve')
                                        ? 'bg-white text-cyan-600 shadow-sm'
                                        : 'text-gray-800 hover:bg-white/50 hover:text-cyan-600'
                                        }`}
                                    onClick={closeMenu}
                                >
                                    <Calendar className="w-5 h-5" />
                                    Reserve
                                </Link>
                                <Link
                                    to="/fines"
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${isActive('/fines')
                                        ? 'bg-white text-cyan-600 shadow-sm'
                                        : 'text-gray-800 hover:bg-white/50 hover:text-cyan-600'
                                        }`}
                                    onClick={closeMenu}
                                >
                                    <CreditCard className="w-5 h-5" />
                                    Fines
                                </Link>
                                <Link
                                    to="/admin/login"
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${isActive('/admin/login')
                                        ? 'bg-white text-cyan-600 shadow-sm'
                                        : 'text-gray-800 hover:bg-white/50 hover:text-cyan-600'
                                        }`}
                                    onClick={closeMenu}
                                >
                                    <ShieldCheck className="w-5 h-5" />
                                    Admin
                                </Link>
                            </nav>
                        </div>
                    </div>
                )}
            </div>

            {/* Main Content */}
            <main className={`flex-grow flex flex-col ${isHome || isTicket ? '' : 'pt-24 md:pt-28'}`}>
                <Outlet />
            </main>

            <footer className="bg-white border-t border-gray-200 mt-auto print:hidden">
                <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                    <p className="text-center text-gray-400 text-sm">
                        &copy; {new Date().getFullYear()} CampusPark System. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
