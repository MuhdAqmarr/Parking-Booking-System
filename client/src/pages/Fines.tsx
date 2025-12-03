import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import { Search, CreditCard, CheckCircle, AlertCircle } from 'lucide-react';

const Fines: React.FC = () => {
    const [searchParams] = useSearchParams();
    const [query, setQuery] = useState({ plateNum: '', studentNo: '', staffNo: '' });
    const [fines, setFines] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        const confirmPayment = async () => {
            const success = searchParams.get('success');
            const session_id = searchParams.get('session_id');

            if (success && session_id) {
                try {
                    await axios.post('/api/public/fines/confirm', { session_id });
                    setSuccessMsg('Payment confirmed! Thank you.');
                    // Clear query params to prevent re-triggering
                    window.history.replaceState({}, '', '/fines');
                } catch (error) {
                    setError('Payment confirmation failed. Please contact support.');
                }
            }
        };

        confirmPayment();
    }, [searchParams]);

    const handleSearch = async () => {
        setLoading(true);
        setError('');
        setFines([]);
        try {
            const params: any = {};
            if (query.plateNum) params.plateNum = query.plateNum;
            if (query.studentNo) params.studentNo = query.studentNo;
            if (query.staffNo) params.staffNo = query.staffNo;

            if (Object.keys(params).length === 0) {
                setError('Please enter at least one search criteria');
                setLoading(false);
                return;
            }

            const res = await axios.get('/api/public/fines', { params });
            setFines(res.data);
            if (res.data.length === 0) {
                setError('No unpaid fines found.');
            }
        } catch (err) {
            setError('Search failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handlePay = async (fineID: number) => {
        try {
            const res = await axios.post(`/api/public/fines/${fineID}/pay`);
            window.location.href = res.data.url;
        } catch (err) {
            alert('Payment initiation failed');
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Pay Parking Fines</h1>

            {successMsg && (
                <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2" /> {successMsg}
                </div>
            )}

            <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Plate</label>
                        <input
                            type="text"
                            className="w-full p-2 border border-gray-300 rounded-lg"
                            placeholder="ABC-123"
                            value={query.plateNum}
                            onChange={(e) => setQuery({ ...query, plateNum: e.target.value.toUpperCase() })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Student No</label>
                        <input
                            type="text"
                            className="w-full p-2 border border-gray-300 rounded-lg"
                            placeholder="S123456"
                            value={query.studentNo}
                            onChange={(e) => setQuery({ ...query, studentNo: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Staff No</label>
                        <input
                            type="text"
                            className="w-full p-2 border border-gray-300 rounded-lg"
                            placeholder="E98765"
                            value={query.staffNo}
                            onChange={(e) => setQuery({ ...query, staffNo: e.target.value })}
                        />
                    </div>
                </div>
                <div className="mt-4 flex justify-end">
                    <button
                        onClick={handleSearch}
                        disabled={loading}
                        className="flex items-center px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50"
                    >
                        {loading ? 'Searching...' : 'Search Fines'} <Search className="ml-2 w-4 h-4" />
                    </button>
                </div>
            </div>

            {error && (
                <div className="text-center text-gray-500 py-8">
                    <AlertCircle className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                    {error}
                </div>
            )}

            {loading && (
                <div className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
                    <div className="h-12 bg-gray-100 border-b border-gray-200"></div>
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-16 border-b border-gray-100"></div>
                    ))}
                </div>
            )}

            {!loading && fines.length > 0 && (
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fine ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {fines.map((fine) => (
                                <tr key={fine.fineID}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{fine.fineID}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(fine.issuedDate).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{fine.remarks || fine.fineType}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">RM{fine.amount.toFixed(2)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handlePay(fine.fineID)}
                                            className="text-cyan-600 hover:text-cyan-900 flex items-center"
                                        >
                                            Pay Online <CreditCard className="ml-1 w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Fines;
