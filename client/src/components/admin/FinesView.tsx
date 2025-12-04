import React, { useState, useEffect } from 'react';
import AdminTable from './AdminTable';
import Modal from './Modal';
import CustomSelect from '../ui/CustomSelect';
import { fetchWithAuth } from '../../utils/api';
import toast from 'react-hot-toast';

const FinesView: React.FC = () => {
    const [fines, setFines] = useState<any[]>([]);
    const [sessions, setSessions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        sessionID: '',
        fineType: 'Overstay',
        amount: 0,
        remarks: ''
    });

    const loadData = async () => {
        setLoading(true);
        try {
            const [fData, sData] = await Promise.all([
                fetchWithAuth('/api/admin/fines'),
                fetchWithAuth('/api/admin/sessions')
            ]);
            setFines(fData);
            setSessions(sData);
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
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
        { key: 'amount', label: 'Amount', render: (val: number) => `RM${Number(val).toFixed(2)}` },
        {
            key: 'status', label: 'Status', render: (val: string) => (
                <span className={`px-2 py-1 rounded text-xs ${val === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {val}
                </span>
            )
        },
        { key: 'issuedDate', label: 'Date', render: (d: string) => new Date(d).toLocaleDateString() },
    ];

    // Prepare options for CustomSelect
    const sessionOptions = sessions.map(s => {
        const isViolation = s.isViolation === true || s.isViolation === 1;
        const isActiveOverstay = !s.exitTime && s.reservation?.endTime && new Date(s.reservation.endTime) < new Date();

        const badges: any[] = [];
        if (isViolation) badges.push({ text: 'VIOLATION', color: 'red' });
        if (isActiveOverstay) badges.push({ text: 'OVERSTAY', color: 'orange' });

        return {
            value: s.sessionID,
            label: `#${s.sessionID} - ${s.vehicle?.plateNum}`,
            subLabel: new Date(s.entryTime).toLocaleString(),
            badges
        };
    });

    const typeOptions = [
        { value: 'Overstay', label: 'Overstay' },
        { value: 'Illegal Parking', label: 'Illegal Parking' },
        { value: 'No Permit', label: 'No Permit' },
        { value: 'Damage', label: 'Damage' }
    ];

    return (
        <>
            <AdminTable
                title="Fines & Violations"
                columns={columns}
                data={fines}
                filters={[
                    { key: 'status', label: 'Status', options: ['Unpaid', 'Paid'] },
                    { key: 'fineType', label: 'Type', options: ['Overstay', 'Illegal Parking', 'No Permit', 'Damage'] }
                ]}
                onDelete={handleDelete}
                onAdd={handleIssueFine}
                onRefresh={loadData}
                isLoading={loading}
            />

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Issue Fine"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <CustomSelect
                        label="Session (Vehicle)"
                        value={formData.sessionID}
                        onChange={(val) => setFormData({ ...formData, sessionID: String(val) })}
                        options={sessionOptions}
                        placeholder="Select Session"
                        required
                    />

                    <CustomSelect
                        label="Type"
                        value={formData.fineType}
                        onChange={(val) => setFormData({ ...formData, fineType: String(val) })}
                        options={typeOptions}
                        required
                    />
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Amount (RM)</label>
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
