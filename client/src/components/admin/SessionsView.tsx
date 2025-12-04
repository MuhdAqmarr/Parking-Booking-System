import React, { useState, useEffect } from 'react';
import AdminTable from './AdminTable';
import Modal from './Modal';
import CustomSelect from '../ui/CustomSelect';
import { fetchWithAuth } from '../../utils/api';
import { LogOut } from 'lucide-react';
import toast from 'react-hot-toast';

const SessionsView: React.FC = () => {
    const [sessions, setSessions] = useState<any[]>([]);
    const [lots, setLots] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        plateNum: '',
        lotID: '',
        proofCode: ''
    });

    const loadData = async () => {
        setLoading(true);
        try {
            const [sData, lData] = await Promise.all([
                fetchWithAuth('/api/admin/sessions'),
                fetchWithAuth('/api/admin/lots')
            ]);
            setSessions(sData);
            setLots(lData);
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    };

    useEffect(() => { loadData(); }, []);

    const handleCheckIn = () => {
        setFormData({ plateNum: '', lotID: '', proofCode: '' });
        setIsModalOpen(true);
    };

    const handleCheckOut = async (sessionID: number) => {
        if (!window.confirm('Check-out this vehicle?')) return;
        try {
            await fetchWithAuth(`/api/admin/sessions/${sessionID}/check-out`, { method: 'POST' });
            toast.success('Vehicle checked out successfully');
            loadData();
        } catch (error) { toast.error('Failed to check-out'); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await fetchWithAuth('/api/admin/sessions/check-in', {
                method: 'POST',
                body: JSON.stringify({
                    ...formData,
                    lotID: parseInt(String(formData.lotID))
                })
            });
            toast.success('Vehicle checked in successfully');
            setIsModalOpen(false);
            loadData();
        } catch (error) { toast.error('Check-in failed. Ensure vehicle exists or plate is correct.'); }
    };

    const handleDelete = async (item: any) => {
        try {
            await fetchWithAuth(`/api/admin/sessions/${item.sessionID}`, { method: 'DELETE' });
            toast.success('Session record deleted');
            loadData();
        } catch (error) { toast.error('Failed to delete session'); }
    };

    const columns = [

        { key: 'vehicle.plateNum', label: 'Plate', render: (_: any, row: any) => row.vehicle?.plateNum || '-' },
        { key: 'lot.lotNumber', label: 'Lot', render: (_: any, row: any) => row.lot?.lotNumber || '-' },
        { key: 'entryTime', label: 'Entry', render: (d: string) => new Date(d).toLocaleString() },
        { key: 'exitTime', label: 'Exit', render: (d: string) => d ? new Date(d).toLocaleString() : '-' },
        {
            key: 'status',
            label: 'Status',
            render: (_: any, row: any) => {
                if (row.exitTime) {
                    // Completed session - check if it was an overstay
                    if (row.isViolation) {
                        return (
                            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800">
                                Completed (Overstay)
                            </span>
                        );
                    }
                    return (
                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                            Completed
                        </span>
                    );
                }

                // Check for overstay
                const now = new Date();
                const isOverstay = row.reservation?.endTime && new Date(row.reservation.endTime) < now;

                if (isOverstay) {
                    return (
                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800">
                            Overstay
                        </span>
                    );
                }

                return (
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                        Active
                    </span>
                );
            }
        }
    ];

    const actions = (row: any) => (
        !row.exitTime && (
            <button
                onClick={() => handleCheckOut(row.sessionID)}
                className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-700 transition-colors flex items-center gap-1 shadow-sm mr-2"
            >
                <LogOut className="w-3 h-3" />
                Check-out
            </button>
        )
    );

    const lotOptions = lots
        .filter(l => l.status === 'Available')
        .map(l => ({
            value: l.lotID,
            label: `${l.lotNumber} (${l.zone?.zoneName})`,
            badges: [{ text: 'Available', color: 'green' as const }]
        }));

    return (
        <>
            <AdminTable
                title="Parking Sessions"
                columns={columns}
                data={sessions}
                actions={actions}
                onDelete={handleDelete}
                onAdd={handleCheckIn}
                onRefresh={loadData}
                isLoading={loading}
            />

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Check-in Vehicle"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Plate Number</label>
                        <input
                            className="w-full p-2 border border-gray-300 rounded mt-1"
                            value={formData.plateNum}
                            onChange={e => setFormData({ ...formData, plateNum: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <CustomSelect
                            label="Parking Lot (Optional if Reserved)"
                            value={formData.lotID}
                            onChange={(val) => setFormData({ ...formData, lotID: String(val) })}
                            options={lotOptions}
                            placeholder="Select Lot (or Auto-detect)"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Reservation Code (Optional)</label>
                        <input
                            className="w-full p-2 border border-gray-300 rounded mt-1"
                            value={formData.proofCode}
                            onChange={e => setFormData({ ...formData, proofCode: e.target.value })}
                            placeholder="e.g. RES-XXXX"
                        />
                    </div>
                    <button type="submit" className="w-full bg-cyan-600 text-white py-2 rounded hover:bg-cyan-700">
                        Check-in
                    </button>
                </form>
            </Modal>
        </>
    );
};

export default SessionsView;
