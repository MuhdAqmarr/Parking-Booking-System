import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, DollarSign, AlertTriangle, Info, CheckCircle } from 'lucide-react';

const VisitorInfo: React.FC = () => {
    return (
        <div className="bg-gray-50 min-h-screen pb-12">
            {/* Header */}
            <div className="bg-cyan-600 py-12 px-4 sm:px-6 lg:px-8 text-center text-white">
                <h1 className="text-3xl font-extrabold sm:text-4xl">Visitor Parking Guide</h1>
                <p className="mt-4 text-xl text-cyan-100 max-w-2xl mx-auto">
                    Everything you need to know about parking on campus as a guest.
                </p>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
                {/* Key Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-white rounded-2xl shadow-lg p-6 flex items-center space-x-4">
                        <div className="p-3 bg-green-100 text-green-600 rounded-xl">
                            <DollarSign className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Parking Fee</p>
                            <h3 className="text-2xl font-bold text-gray-900">Free</h3>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl shadow-lg p-6 flex items-center space-x-4">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                            <Clock className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Operating Hours</p>
                            <h3 className="text-2xl font-bold text-gray-900">7 AM - 10 PM</h3>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl shadow-lg p-6 flex items-center space-x-4">
                        <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                            <MapPin className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Designated Zones</p>
                            <h3 className="text-2xl font-bold text-gray-900">Visitor / Mixed</h3>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Rules & Info */}
                    <div className="lg:col-span-2 space-y-8">
                        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                                <Info className="w-6 h-6 text-cyan-600 mr-2" />
                                How to Park
                            </h2>
                            <div className="space-y-6">
                                <div className="flex">
                                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-600 font-bold">1</div>
                                    <div className="ml-4">
                                        <h3 className="text-lg font-medium text-gray-900">Book Online (Recommended)</h3>
                                        <p className="mt-1 text-gray-500">
                                            Reserve a spot in advance using our <Link to="/reserve" className="text-cyan-600 hover:underline">booking page</Link>. You'll receive a digital pass with a QR code.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex">
                                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-600 font-bold">2</div>
                                    <div className="ml-4">
                                        <h3 className="text-lg font-medium text-gray-900">Walk-in Parking</h3>
                                        <p className="mt-1 text-gray-500">
                                            If you haven't booked, look for available lots in Visitor zones. You must register your vehicle at the security post upon entry.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex">
                                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-600 font-bold">3</div>
                                    <div className="ml-4">
                                        <h3 className="text-lg font-medium text-gray-900">Park Correctly</h3>
                                        <p className="mt-1 text-gray-500">
                                            Ensure you park only in lots marked "Visitor" or "Mixed". Do not park in "Staff" or "Student" reserved lots.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                                <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
                                Visitor Zones
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="border border-gray-200 rounded-xl p-4 hover:border-cyan-300 transition-colors">
                                    <h3 className="font-bold text-gray-900">Zone A (Main Entrance)</h3>
                                    <p className="text-sm text-gray-500 mt-1">Closest to Admin Building</p>
                                    <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-md font-medium">Visitor Only</span>
                                </div>
                                <div className="border border-gray-200 rounded-xl p-4 hover:border-cyan-300 transition-colors">
                                    <h3 className="font-bold text-gray-900">Zone C (Sports Complex)</h3>
                                    <p className="text-sm text-gray-500 mt-1">Large capacity, 5 min walk to center</p>
                                    <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md font-medium">Mixed Use</span>
                                </div>
                                <div className="border border-gray-200 rounded-xl p-4 hover:border-cyan-300 transition-colors">
                                    <h3 className="font-bold text-gray-900">Zone E (Library)</h3>
                                    <p className="text-sm text-gray-500 mt-1">Limited spots available</p>
                                    <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md font-medium">Mixed Use</span>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Rules & Actions */}
                    <div className="space-y-8">
                        <div className="bg-amber-50 rounded-2xl border border-amber-100 p-6">
                            <h3 className="text-lg font-bold text-amber-800 mb-4 flex items-center">
                                <AlertTriangle className="w-5 h-5 mr-2" />
                                Important Rules
                            </h3>
                            <ul className="space-y-3 text-amber-900 text-sm">
                                <li className="flex items-start">
                                    <span className="mr-2">•</span>
                                    No overnight parking allowed without prior approval.
                                </li>
                                <li className="flex items-start">
                                    <span className="mr-2">•</span>
                                    Do not double park or block driveways.
                                </li>
                                <li className="flex items-start">
                                    <span className="mr-2">•</span>
                                    Speed limit on campus is 30 km/h.
                                </li>
                                <li className="flex items-start">
                                    <span className="mr-2">•</span>
                                    Violators will be fined $50.
                                </li>
                            </ul>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-center">
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Ready to visit?</h3>
                            <p className="text-gray-500 text-sm mb-6">Secure your spot now to save time.</p>
                            <Link
                                to="/reserve"
                                className="block w-full bg-cyan-600 text-white py-3 rounded-xl font-semibold hover:bg-cyan-700 transition-colors shadow-lg shadow-cyan-500/30"
                            >
                                Book Parking
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VisitorInfo;
