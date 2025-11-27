import React from 'react';
import { Link } from 'react-router-dom';
import { Car, CreditCard, ShieldCheck } from 'lucide-react';
import HeroBg from '../assets/Hero-Background.png';

import AnnouncementBar from '../components/home/AnnouncementBar';
import HowItWorks from '../components/home/HowItWorks';
import LiveOverview from '../components/home/LiveOverview';
import QuickAccess from '../components/home/QuickAccess';
import FAQ from '../components/home/FAQ';

const Landing: React.FC = () => {
    return (
        <div className="flex flex-col">
            {/* Hero Section */}
            <section className="relative bg-gray-900 overflow-hidden min-h-screen flex items-center justify-center">
                {/* Background Image */}
                <div className="absolute inset-0">
                    <img
                        src={HeroBg}
                        alt="Campus Parking"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40" /> {/* Overlay for readability */}
                </div>

                {/* Content */}
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl drop-shadow-lg">
                        <span className="block">Smart Parking for</span>
                        <span className="block text-cyan-400 mt-2">Campus Life</span>
                    </h1>
                    <p className="mt-4 max-w-lg mx-auto text-xl text-gray-100 sm:max-w-3xl drop-shadow-md">
                        Book your parking spot in seconds. Whether you're a student, staff, or visitor, we've got a space for you.
                    </p>
                    <div className="mt-8 max-w-md mx-auto sm:flex sm:justify-center md:mt-10 gap-4">
                        <div className="rounded-md shadow">
                            <Link
                                to="/reserve"
                                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-cyan-600 hover:bg-cyan-700 md:py-4 md:text-lg transition-all"
                            >
                                Reserve Now
                            </Link>
                        </div>
                        <div className="mt-3 sm:mt-0">
                            <Link
                                to="/fines"
                                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-cyan-100 bg-white/10 backdrop-blur-sm hover:bg-white/20 md:py-4 md:text-lg transition-all"
                            >
                                Pay Fines
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <AnnouncementBar />

            {/* Features */}
            <section className="py-12 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="lg:text-center">
                        <h2 className="text-base text-cyan-600 font-semibold tracking-wide uppercase">Features</h2>
                        <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                            A better way to park
                        </p>
                    </div>

                    <div className="mt-10">
                        <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
                            <div className="flex flex-col items-center text-center">
                                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-cyan-500 text-white">
                                    <Car className="h-6 w-6" />
                                </div>
                                <h3 className="mt-5 text-lg leading-6 font-medium text-gray-900">Easy Booking</h3>
                                <p className="mt-2 text-base text-gray-500">
                                    Select your zone, choose a spot, and book instantly.
                                </p>
                            </div>

                            <div className="flex flex-col items-center text-center">
                                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-cyan-500 text-white">
                                    <ShieldCheck className="h-6 w-6" />
                                </div>
                                <h3 className="mt-5 text-lg leading-6 font-medium text-gray-900">Secure & Validated</h3>
                                <p className="mt-2 text-base text-gray-500">
                                    Automatic validation for students and staff.
                                </p>
                            </div>

                            <div className="flex flex-col items-center text-center">
                                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-cyan-500 text-white">
                                    <CreditCard className="h-6 w-6" />
                                </div>
                                <h3 className="mt-5 text-lg leading-6 font-medium text-gray-900">Online Payments</h3>
                                <p className="mt-2 text-base text-gray-500">
                                    Pay fines easily with secure online payments.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <HowItWorks />
            <LiveOverview />
            <QuickAccess />
            <FAQ />
        </div>
    );
};

export default Landing;
