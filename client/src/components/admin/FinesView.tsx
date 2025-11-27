import React, { useState, useEffect } from 'react';
import AdminTable from './AdminTable';
import Modal from './Modal';
import { fetchWithAuth } from '../../utils/api';
import toast from 'react-hot-toast';

const FinesView: React.FC = () => {
    const [fines, setFines] = useState<any[]>([]);
    const [sessions, setSessions] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        sessionID: '',
        fineType: 'Overstay',
        amount: 0,
        remarks: ''
    });

    const loadData = async () => {
        try {
            const [fData, sData] = await Promise.all([
                fetchWithAuth('/api/admin/fines'),
                fetchWithAuth('/api/admin/sessions')
            ]);
            setFines(fData);
            setSessions(sData);
        } catch (error) { console.error(error); }
    };

    useEffect(() => { loadData(); }, []);

    const handleIssueFine = () => {
        setFormData({ sessionID: '', fineType: 'Overstay', amount: 0, remarks: '' });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await fetchWithAuth('/api/admin/fines', {
                method: 'POST',
                body: JSON.stringify({
                    ...formData,
                    sessionID: parseInt(String(formData.sessionID))
                })
            });
            toast.success('Fine issued successfully');
            setIsModalOpen(false);
            loadData();
        } catch (error) { toast.error('Failed to issue fine'); }
    };

    const handleDelete = async (item: any) => {
        try {
            await fetchWithAuth(`/api/admin/fines/${item.fineID}`, { method: 'DELETE' });
            toast.success('Fine deleted successfully');
            loadData();
        } catch (error) { toast.error('Failed to delete fine'); }
    };

    const columns = [

        { key: 'session', label: 'User', render: (s: any) => s?.vehicle?.campusUser?.fullName || 'Unknown' },
        { key: 'fineType', label: 'Type' },
        { key: 'amount', label: 'Amount', render: (val: number) => `$${Number(val).toFixed(2)}` },
        {
            key: 'status', label: 'Status', render: (val: string) => (
                <span className={`px-2 py-1 rounded text-xs ${val === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {val}
                </span>
            )
        },
        { key: 'issuedDate', label: 'Date', render: (d: string) => new Date(d).toLocaleDateString() },
    ];

    return (
        <>
            <div className="flex justify-end mb-4 space-x-2">
                <button
                    onClick={loadData}
                    className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                    Refresh
                </button>
                <button
                    onClick={handleIssueFine}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                    Issue Fine
                </button>
            </div>

            <AdminTable
                title="Fines & Violations"
                columns={columns}
                data={fines}
                filters={[
                    { key: 'status', label: 'Status', options: ['Unpaid', 'Paid'] },
                    { key: 'fineType', label: 'Type', options: ['Overstay', 'Illegal Parking', 'No Permit', 'Damage'] }
                ]}
                onDelete={handleDelete}
            />

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Issue Fine"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Session (Vehicle)</label>
                        <select
                            className="w-full p-2 border border-gray-300 rounded mt-1"
                            value={formData.sessionID}
                            onChange={e => setFormData({ ...formData, sessionID: e.target.value })}
                            required
                        >
                            <option value="">Select Session</option>
                            {sessions.map(s => (
                                <option key={s.sessionID} value={s.sessionID}>
                                    #{s.sessionID} - {s.vehicle?.plateNum} ({new Date(s.entryTime).toLocaleDateString()})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Type</label>
                        <select
                            className="w-full p-2 border border-gray-300 rounded mt-1"
                            value={formData.fineType}
                            onChange={e => setFormData({ ...formData, fineType: e.target.value })}
                        >
                            <option value="Overstay">Overstay</option>
                            <option value="Illegal Parking">Illegal Parking</option>
                            <option value="No Permit">No Permit</option>
                            <option value="Damage">Damage</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Amount ($)</label>
                        <input
                            type="number"
                            className="w-full p-2 border border-gray-300 rounded mt-1"
                            value={formData.amount}
                            onChange={e => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Remarks</label>
                        <textarea
                            className="w-full p-2 border border-gray-300 rounded mt-1"
                            value={formData.remarks}
                            onChange={e => setFormData({ ...formData, remarks: e.target.value })}
                        />
                    </div>
                    <button type="submit" className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700">
                        Issue Fine
                    </button>
                </form>
            </Modal>
        </>
    );
};

export default FinesView;
