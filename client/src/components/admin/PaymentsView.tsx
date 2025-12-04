import React, { useState, useEffect } from 'react';
import AdminTable from './AdminTable';
import Modal from './Modal';
import CustomSelect from '../ui/CustomSelect';
import { fetchWithAuth } from '../../utils/api';
import toast from 'react-hot-toast';

const PaymentsView: React.FC = () => {
    const [payments, setPayments] = useState<any[]>([]);
    const [fines, setFines] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        fineID: '',
        amountPaid: 0,
        receiptNum: ''
    });

    const loadData = async () => {
        setLoading(true);
        try {
            const [pData, fData] = await Promise.all([
                fetchWithAuth('/api/admin/payments'),
                fetchWithAuth('/api/admin/fines')
            ]);
            setPayments(pData);
            setFines(fData);
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    };

    useEffect(() => { loadData(); }, []);

    const handleRecordPayment = () => {
        setFormData({ fineID: '', amountPaid: 0, receiptNum: '' });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await fetchWithAuth('/api/admin/payments', {
                method: 'POST',
                body: JSON.stringify({
                    ...formData,
                    fineID: parseInt(String(formData.fineID)),
                    amountPaid: parseFloat(String(formData.amountPaid))
                })
            });
            toast.success('Payment recorded successfully');
            setIsModalOpen(false);
            loadData();
        } catch (error) { toast.error('Failed to record payment'); }
    };

    const handleDelete = async (item: any) => {
        try {
            await fetchWithAuth(`/api/admin/payments/${item.paymentID}`, { method: 'DELETE' });
            toast.success('Payment record deleted');
            loadData();
        } catch (error) { toast.error('Failed to delete payment'); }
    };

    const columns = [

        { key: 'fineID', label: 'Fine ID' },
        { key: 'amountPaid', label: 'Amount', render: (val: number) => `RM${val}` },
        { key: 'paymentMethod', label: 'Method' },
        { key: 'receiptNum', label: 'Receipt' },
        { key: 'paymentDate', label: 'Date', render: (d: string) => new Date(d).toLocaleDateString() },
    ];

    const fineOptions = fines.filter(f => f.status === 'Unpaid').map(f => ({
        value: f.fineID,
        label: `#${f.fineID} - RM${f.amount} (${f.fineType})`
    }));

    return (
        <>
            <AdminTable
                title="Payments"
                columns={columns}
                data={payments}
                onDelete={handleDelete}
                onAdd={handleRecordPayment}
                onRefresh={loadData}
                isLoading={loading}
            />

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Record Cash Payment"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <CustomSelect
                        label="Fine"
                        value={formData.fineID}
                        onChange={(val) => setFormData({ ...formData, fineID: String(val) })}
                        options={fineOptions}
                        required
                    />
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Amount Paid (RM)</label>
                        <input
                            type="number"
                            className="w-full p-2 border border-gray-300 rounded mt-1"
                            value={formData.amountPaid}
                            onChange={e => setFormData({ ...formData, amountPaid: parseFloat(e.target.value) })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Receipt Number</label>
                        <input
                            className="w-full p-2 border border-gray-300 rounded mt-1"
                            value={formData.receiptNum}
                            onChange={e => setFormData({ ...formData, receiptNum: e.target.value })}
                            required
                        />
                    </div>
                    <button type="submit" className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
                        Record Payment
                    </button>
                </form>
            </Modal>
        </>
    );
};

export default PaymentsView;
