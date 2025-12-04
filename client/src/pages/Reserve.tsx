import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Car, Calendar, MapPin, User, ArrowRight, ArrowLeft } from 'lucide-react';
import CustomSelect from '../components/ui/CustomSelect';

const steps = [
    { id: 1, name: 'User Type', icon: User },
    { id: 2, name: 'Details', icon: Car },
    { id: 3, name: 'Date & Time', icon: Calendar },
    { id: 4, name: 'Location', icon: MapPin },
    { id: 5, name: 'Select Lot', icon: CheckCircle },
    { id: 6, name: 'Confirm', icon: CheckCircle },
];

const Reserve: React.FC = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        userType: '',
        studentNo: '',
        staffNo: '',
        name: '',
        email: '',
        phoneNum: '',
        plateNum: '',
        vehicleType: 'Car',
        reservationDate: new Date().toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '17:00',
        facultyID: '',
        zoneID: '',
        lotID: '',
    });

    const [faculties, setFaculties] = useState<any[]>([]);
    const [zones, setZones] = useState<any[]>([]);
    const [lots, setLots] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingFaculties, setLoadingFaculties] = useState(false);
    const [loadingZones, setLoadingZones] = useState(false);
    const [loadingLots, setLoadingLots] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (currentStep === 4) {
            fetchFaculties();
        }
    }, [currentStep]);

    useEffect(() => {
        if (formData.facultyID) {
            fetchZones();
        }
    }, [formData.facultyID]);

    useEffect(() => {
        if (formData.zoneID && currentStep === 5) {
            fetchLots();
        }
    }, [formData.zoneID, currentStep]);

    const fetchFaculties = async () => {
        setLoadingFaculties(true);
        try {
            const res = await axios.get('/api/public/faculties');
            setFaculties(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingFaculties(false);
        }
    };

    const fetchZones = async () => {
        setLoadingZones(true);
        try {
            const res = await axios.get(`/api/public/zones?facultyID=${formData.facultyID}`);
            setZones(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingZones(false);
        }
    };

    const fetchLots = async () => {
        setLoadingLots(true);
        try {
            const res = await axios.get('/api/public/available-lots', {
                params: {
                    zoneID: formData.zoneID,
                    date: formData.reservationDate,
                    startTime: formData.startTime,
                    endTime: formData.endTime,
                }
            });
            setLots(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingLots(false);
        }
    };

    const handleVerifyUser = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await axios.post('/api/public/verify-campus-user', {
                userType: formData.userType,
                studentNo: formData.studentNo,
                staffNo: formData.staffNo,
            });
            setFormData(prev => ({
                ...prev,
                name: res.data.fullName,
                email: res.data.email,
                phoneNum: res.data.phoneNum || '',
            }));
            setCurrentStep(2);
        } catch (err) {
            setError('Verification failed. Please check your ID.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await axios.post('/api/public/reservations', {
                ...formData,
                facultyID: Number(formData.facultyID),
                zoneID: Number(formData.zoneID),
                lotID: Number(formData.lotID),
            });
            navigate(`/ticket/${res.data.proofCode}`);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Reservation failed');
        } finally {
            setLoading(false);
        }
    };

    const nextStep = () => setCurrentStep(prev => prev + 1);
    const prevStep = () => setCurrentStep(prev => prev - 1);

    const vehicleTypeOptions = [
        { value: 'Car', label: 'Car' },
        { value: 'Motorcycle', label: 'Motorcycle' },
        { value: 'Truck', label: 'Truck' }
    ];

    const facultyOptions = faculties.map(f => ({
        value: f.facultyID,
        label: f.facultyName
    }));

    return (
        <div className="max-w-4xl mx-auto px-4 py-4 sm:py-8">
            {/* Stepper */}
            <div className="mb-6 sm:mb-8 overflow-x-auto">
                <div className="flex items-center justify-between relative min-w-max">
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 -z-10"></div>
                    {steps.map((step) => (
                        <div key={step.id} className="flex flex-col items-center bg-gray-50 px-1 sm:px-2">
                            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold transition-colors ${currentStep >= step.id ? 'bg-cyan-600 text-white' : 'bg-gray-300 text-gray-500'
                                }`}>
                                <step.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                            <span className={`hidden sm:block text-xs mt-2 font-medium ${currentStep >= step.id ? 'text-cyan-600' : 'text-gray-400'
                                }`}>
                                {step.name}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="bg-white shadow-lg rounded-2xl p-4 sm:p-8">
                {error && (
                    <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg border border-red-100">
                        {error}
                    </div>
                )}

                {currentStep === 1 && (
                    <div className="space-y-6">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Select User Type</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {['Student', 'Staff', 'Visitor'].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setFormData({ ...formData, userType: type })}
                                    className={`p-4 sm:p-6 rounded-xl border-2 transition-all ${formData.userType === type
                                        ? 'border-cyan-500 bg-cyan-50 text-cyan-700'
                                        : 'border-gray-200 hover:border-cyan-200'
                                        }`}
                                >
                                    <span className="block text-base sm:text-lg font-semibold">{type}</span>
                                </button>
                            ))}
                        </div>

                        {formData.userType && formData.userType !== 'Visitor' && (
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {formData.userType} Number
                                </label>
                                <input
                                    type="text"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                    placeholder={`Enter your ${formData.userType} ID`}
                                    value={formData.userType === 'Student' ? formData.studentNo : formData.staffNo}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        [formData.userType === 'Student' ? 'studentNo' : 'staffNo']: e.target.value
                                    })}
                                />
                            </div>
                        )}

                        <div className="flex justify-end mt-6">
                            <button
                                onClick={() => formData.userType === 'Visitor' ? nextStep() : handleVerifyUser()}
                                disabled={!formData.userType || (formData.userType !== 'Visitor' && !formData.studentNo && !formData.staffNo) || loading}
                                className="flex items-center px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50"
                            >
                                {loading ? 'Verifying...' : 'Continue'} <ArrowRight className="ml-2 w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {currentStep === 2 && (
                    <div className="space-y-6">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
                                    value={formData.name}
                                    readOnly={formData.userType !== 'Visitor'}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
                                    value={formData.email}
                                    readOnly={formData.userType !== 'Visitor'}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                                {formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) && (
                                    <p className="text-red-500 text-xs mt-1">Please enter a valid email address.</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                <input
                                    type="tel"
                                    className="w-full p-3 border border-gray-300 rounded-lg"
                                    value={formData.phoneNum}
                                    onChange={(e) => setFormData({ ...formData, phoneNum: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Plate</label>
                                <input
                                    type="text"
                                    className="w-full p-3 border border-gray-300 rounded-lg"
                                    value={formData.plateNum}
                                    onChange={(e) => setFormData({ ...formData, plateNum: e.target.value.toUpperCase() })}
                                />
                            </div>
                            <div>
                                <CustomSelect
                                    label="Vehicle Type"
                                    value={formData.vehicleType}
                                    onChange={(val) => setFormData({ ...formData, vehicleType: String(val) })}
                                    options={vehicleTypeOptions}
                                />
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row justify-between gap-4 mt-6">
                            <button onClick={prevStep} className="flex items-center justify-center px-6 py-3 text-gray-600 hover:text-gray-900">
                                <ArrowLeft className="mr-2 w-4 h-4" /> Back
                            </button>
                            <button
                                onClick={nextStep}
                                disabled={!formData.name || !formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) || !formData.phoneNum || !formData.plateNum || !formData.vehicleType}
                                className="flex items-center justify-center px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Continue <ArrowRight className="ml-2 w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {currentStep === 3 && (
                    <div className="space-y-6">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Date & Time</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                <input
                                    type="date"
                                    className="w-full p-3 border border-gray-300 rounded-lg"
                                    value={formData.reservationDate}
                                    min={new Date().toISOString().split('T')[0]}
                                    onChange={(e) => setFormData({ ...formData, reservationDate: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                                <input
                                    type="time"
                                    className="w-full p-3 border border-gray-300 rounded-lg"
                                    value={formData.startTime}
                                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                                <input
                                    type="time"
                                    className="w-full p-3 border border-gray-300 rounded-lg"
                                    value={formData.endTime}
                                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row justify-between gap-4 mt-6">
                            <button onClick={prevStep} className="flex items-center justify-center px-6 py-3 text-gray-600 hover:text-gray-900">
                                <ArrowLeft className="mr-2 w-4 h-4" /> Back
                            </button>
                            <button onClick={nextStep} className="flex items-center justify-center px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700">
                                Continue <ArrowRight className="ml-2 w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {currentStep === 4 && (
                    <div className="space-y-6">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Select Location</h2>
                        <div>
                            <CustomSelect
                                label="Faculty"
                                value={formData.facultyID}
                                onChange={(val) => setFormData({ ...formData, facultyID: String(val), zoneID: '' })}
                                options={facultyOptions}
                                placeholder={loadingFaculties ? 'Loading Faculties...' : 'Select Faculty'}
                                disabled={loadingFaculties}
                            />
                        </div>
                        {formData.facultyID && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Zone</label>
                                {loadingZones ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
                                        {[1, 2, 3, 4].map(i => (
                                            <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {zones.map((z) => {
                                            const allowed =
                                                (formData.userType === 'Staff' && ['Staff', 'Mixed'].includes(z.zoneType)) ||
                                                (formData.userType === 'Student' && ['Student', 'Mixed'].includes(z.zoneType)) ||
                                                (formData.userType === 'Visitor' && ['Visitor', 'Mixed'].includes(z.zoneType));

                                            return (
                                                <button
                                                    key={z.zoneID}
                                                    onClick={() => allowed && setFormData({ ...formData, zoneID: z.zoneID })}
                                                    disabled={!allowed}
                                                    className={`p-4 rounded-lg border text-left transition-all ${formData.zoneID === z.zoneID
                                                        ? 'border-cyan-500 bg-cyan-50 ring-1 ring-cyan-500'
                                                        : allowed
                                                            ? 'border-gray-200 hover:border-cyan-200'
                                                            : 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                                                        }`}
                                                >
                                                    <div className="font-semibold text-gray-900">{z.zoneName}</div>
                                                    <div className="text-sm text-gray-500">{z.zoneType} • {z.capacity} spots</div>
                                                    {!allowed && <div className="text-xs text-red-500 mt-1">Not available for {formData.userType}</div>}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                        <div className="flex flex-col sm:flex-row justify-between gap-4 mt-6">
                            <button onClick={prevStep} className="flex items-center justify-center px-6 py-3 text-gray-600 hover:text-gray-900">
                                <ArrowLeft className="mr-2 w-4 h-4" /> Back
                            </button>
                            <button
                                onClick={nextStep}
                                disabled={!formData.zoneID}
                                className="flex items-center justify-center px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50"
                            >
                                Continue <ArrowRight className="ml-2 w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {currentStep === 5 && (
                    <div className="space-y-6">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Select Parking Lot</h2>
                        {loadingLots ? (
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 animate-pulse">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(i => (
                                    <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                                {lots.map((lot) => (
                                    <button
                                        key={lot.lotID}
                                        onClick={() => !lot.isReserved && setFormData({ ...formData, lotID: lot.lotID })}
                                        disabled={lot.isReserved}
                                        className={`p-3 rounded-lg border text-center transition-all ${formData.lotID === lot.lotID
                                            ? 'bg-cyan-600 text-white border-cyan-600'
                                            : lot.isReserved
                                                ? 'bg-red-50 text-red-400 border-red-100 cursor-not-allowed'
                                                : 'bg-white hover:border-cyan-300 text-gray-700 border-gray-200'
                                            }`}
                                    >
                                        <div className="text-sm font-bold">{lot.lotNumber}</div>
                                        <div className="text-xs">{lot.isReserved ? 'Reserved' : 'Available'}</div>
                                    </button>
                                ))}
                            </div>
                        )}
                        <div className="flex flex-col sm:flex-row justify-between gap-4 mt-6">
                            <button onClick={prevStep} className="flex items-center justify-center px-6 py-3 text-gray-600 hover:text-gray-900">
                                <ArrowLeft className="mr-2 w-4 h-4" /> Back
                            </button>
                            <button
                                onClick={nextStep}
                                disabled={!formData.lotID}
                                className="flex items-center justify-center px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50"
                            >
                                Continue <ArrowRight className="ml-2 w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {currentStep === 6 && (
                    <div className="space-y-6">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Confirm Reservation</h2>
                        <div className="bg-gray-50 rounded-xl p-4 sm:p-6 space-y-4">
                            <div className="flex justify-between border-b border-gray-200 pb-2">
                                <span className="text-gray-500 text-sm sm:text-base">User</span>
                                <span className="font-medium text-sm sm:text-base text-right">{formData.name} ({formData.userType})</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-200 pb-2">
                                <span className="text-gray-500 text-sm sm:text-base">Vehicle</span>
                                <span className="font-medium text-sm sm:text-base">{formData.plateNum} ({formData.vehicleType})</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-200 pb-2">
                                <span className="text-gray-500 text-sm sm:text-base">Date</span>
                                <span className="font-medium text-sm sm:text-base">{formData.reservationDate}</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-200 pb-2">
                                <span className="text-gray-500 text-sm sm:text-base">Time</span>
                                <span className="font-medium text-sm sm:text-base">{formData.startTime} - {formData.endTime}</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-200 pb-2">
                                <span className="text-gray-500 text-sm sm:text-base">Location</span>
                                <span className="font-medium text-sm sm:text-base text-right">
                                    {faculties.find(f => f.facultyID == formData.facultyID)?.facultyName} - {zones.find(z => z.zoneID == formData.zoneID)?.zoneName}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500 text-sm sm:text-base">Lot</span>
                                <span className="font-medium text-cyan-600 text-sm sm:text-base">
                                    {lots.find(l => l.lotID == formData.lotID)?.lotNumber}
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-between gap-4 mt-6">
                            <button onClick={prevStep} className="flex items-center justify-center px-6 py-3 text-gray-600 hover:text-gray-900">
                                <ArrowLeft className="mr-2 w-4 h-4" /> Back
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="flex items-center justify-center px-8 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-lg hover:from-teal-600 hover:to-cyan-700 shadow-lg transform transition hover:scale-105 disabled:opacity-50"
                            >
                                {loading ? 'Confirming...' : 'Confirm Reservation'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Reserve;
