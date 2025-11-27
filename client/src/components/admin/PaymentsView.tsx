import React, { useState, useEffect } from 'react';
import AdminTable from './AdminTable';
import Modal from './Modal';
import { fetchWithAuth } from '../../utils/api';
import toast from 'react-hot-toast';

const PaymentsView: React.FC = () => {
    const [payments, setPayments] = useState<any[]>([]);
    const [fines, setFines] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        fineID: '',
        amountPaid: 0,
        receiptNum: ''
    });

    const loadData = async () => {
        try {
            const [pData, fData] = await Promise.all([
                fetchWithAuth('/api/admin/payments'),
                fetchWithAuth('/api/admin/fines')
            ]);
            setPayments(pData);
            setFines(fData);
        } catch (error) { console.error(error); }
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
        { key: 'amountPaid', label: 'Amount', render: (val: number) => `$${val}` },
        { key: 'paymentMethod', label: 'Method' },
        { key: 'receiptNum', label: 'Receipt' },
        { key: 'paymentDate', label: 'Date', render: (d: string) => new Date(d).toLocaleDateString() },
    ];

    return (
        <>
            <div className="flex justify-end mb-4">
                <button
                    onClick={handleRecordPayment}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                    Record Payment
                </button>
            </div>

            <AdminTable
                title="Payments"
                columns={columns}
                data={payments}
                onDelete={handleDelete}
            />

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Record Cash Payment"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Fine</label>
                        <select
                            className="w-full p-2 border border-gray-300 rounded mt-1"
                            value={formData.fineID}
                            onChange={e => setFormData({ ...formData, fineID: e.target.value })}
                            required
                        >
                            <option value="">Select Fine</option>
                            {fines.filter(f => f.status === 'Unpaid').map(f => (
                                <option key={f.fineID} value={f.fineID}>
                                    #{f.fineID} - ${f.amount} ({f.fineType})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Amount Paid ($)</label>
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
