import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Calendar, Clock, MapPin, Car, Printer, CheckCircle, AlertCircle } from 'lucide-react';
import HeroBackground from '../assets/Hero-Background.png';

const Ticket: React.FC = () => {
    const { proofCode } = useParams();
    const [ticket, setTicket] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTicket = async () => {
            try {
                const res = await axios.get(`/api/public/reservations/${proofCode}`);
                setTicket(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchTicket();
    }, [proofCode]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="animate-pulse flex flex-col items-center">
                <div className="h-12 w-12 bg-gray-200 rounded-full mb-4"></div>
                <div className="h-4 w-32 bg-gray-200 rounded"></div>
            </div>
        </div>
    );

    if (!ticket) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center p-8 bg-white rounded-2xl shadow-lg max-w-sm mx-4">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">Ticket Not Found</h2>
                <p className="text-gray-500">Please check your reservation code and try again.</p>
            </div>
        </div>
    );

    const isExpired = new Date() > new Date(ticket.endTime);
    const isActive = !isExpired && ticket.status !== 'Cancelled';

    return (
        <div
            className="min-h-screen flex items-center justify-center p-4 print:bg-white print:p-0 bg-cover bg-center bg-no-repeat relative pt-32 pb-10"
            style={{ backgroundImage: `url(${HeroBackground})` }}
        >
            {/* Black Overlay */}
            <div className="absolute inset-0 bg-black/50 print:hidden"></div>

            <div className="relative z-10 bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden print:shadow-none print:w-full print:max-w-none backdrop-blur-sm bg-white/95">
                {/* Header */}
                <div className="bg-gray-900 p-4 text-white text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-blue-500"></div>
                    <h1 className="text-xl font-bold tracking-wide uppercase">Parking Pass</h1>
                    <p className="text-gray-400 text-xs mt-1">Official Digital Receipt</p>
                    {isActive && (
                        <div className="absolute top-4 right-4 animate-pulse">
                            <span className="h-2.5 w-2.5 bg-green-500 rounded-full inline-block"></span>
                        </div>
                    )}
                </div>

                {/* QR Code Section */}
                <div className="bg-gray-50 p-6 flex flex-col items-center justify-center border-b border-dashed border-gray-300 relative">
                    {/* Decorative notches */}
                    <div className="absolute -left-3 bottom-[-12px] w-6 h-6 bg-cyan-600 rounded-full print:hidden"></div>
                    <div className="absolute -right-3 bottom-[-12px] w-6 h-6 bg-blue-600 rounded-full print:hidden"></div>

                    <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-200">
                        <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${proofCode}`}
                            alt="QR Code"
                            className="w-32 h-32 object-contain"
                        />
                    </div>
                    <p className="mt-3 text-sm font-mono font-bold text-gray-600 tracking-wider">{ticket.proofCode}</p>
                    <p className="text-[10px] text-gray-400 mt-1">Scan at entry terminal</p>
                </div>

                {/* Details Section */}
                <div className="p-5 space-y-4">
                    {/* Lot Number - Hero */}
                    <div className="text-center">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Assigned Lot</p>
                        <div className="text-4xl font-black text-gray-900 tracking-tighter">
                            {ticket.lot.lotNumber}
                        </div>
                        <div className="inline-block bg-cyan-100 text-cyan-800 text-[10px] px-2 py-0.5 rounded mt-1 font-medium">
                            {ticket.zone.zoneName}
                        </div>
                    </div>

                    {/* Grid Details */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-50 p-2.5 rounded-lg">
                            <div className="flex items-center gap-1.5 text-gray-500 mb-1">
                                <Calendar className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-medium uppercase">Date</span>
                            </div>
                            <p className="font-semibold text-sm text-gray-900">
                                {new Date(ticket.reservationDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                        </div>
                        <div className="bg-gray-50 p-2.5 rounded-lg">
                            <div className="flex items-center gap-1.5 text-gray-500 mb-1">
                                <Clock className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-medium uppercase">Time</span>
                            </div>
                            <p className="font-semibold text-sm text-gray-900">
                                {new Date(ticket.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                                {new Date(ticket.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                        <div className="bg-gray-50 p-2.5 rounded-lg col-span-2">
                            <div className="flex items-center gap-1.5 text-gray-500 mb-1">
                                <MapPin className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-medium uppercase">Location</span>
                            </div>
                            <p className="font-semibold text-sm text-gray-900 truncate">
                                {ticket.faculty.facultyName}
                            </p>
                            <p className="text-[10px] text-gray-500 truncate">{ticket.faculty.locationDesc || ''}</p>
                        </div>
                        <div className="bg-gray-50 p-2.5 rounded-lg col-span-2">
                            <div className="flex items-center gap-1.5 text-gray-500 mb-1">
                                <Car className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-medium uppercase">Vehicle</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <p className="font-semibold text-sm text-gray-900">{ticket.vehicle.plateNum}</p>
                                <span className="text-[10px] bg-gray-200 px-1.5 py-0.5 rounded text-gray-600">{ticket.vehicle.vehicleType}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 p-3 border-t border-gray-100 flex justify-between items-center print:hidden">
                    <div className="flex items-center gap-2">
                        {isActive ? (
                            <div className="flex items-center gap-1.5 text-green-600">
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span className="text-xs font-medium">Valid</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-1.5 text-red-500">
                                <AlertCircle className="w-3.5 h-3.5" />
                                <span className="text-xs font-medium">Expired/Invalid</span>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => window.print()}
                        className="flex items-center gap-1.5 bg-gray-900 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/20"
                    >
                        <Printer className="w-3.5 h-3.5" />
                        Print
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Ticket;
