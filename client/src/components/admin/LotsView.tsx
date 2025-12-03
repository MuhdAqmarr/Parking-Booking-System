import React, { useState, useEffect } from 'react';
import AdminTable from './AdminTable';
import Modal from './Modal';
import { fetchWithAuth } from '../../utils/api';
import toast from 'react-hot-toast';

const LotsView: React.FC = () => {
    const [lots, setLots] = useState<any[]>([]);
    const [zones, setZones] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<any>(null);
    const [formData, setFormData] = useState({
        zoneID: '',
        lotNumber: '',
        status: 'Available',
        isDisabledFriendly: false
    });

    const loadData = async () => {
        setLoading(true);
        try {
            const [lData, zData] = await Promise.all([
                fetchWithAuth('/api/admin/lots'),
                fetchWithAuth('/api/admin/zones')
            ]);
            setLots(lData);
            setZones(zData);
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    };

    useEffect(() => { loadData(); }, []);

    const handleAdd = () => {
        setCurrentItem(null);
        setFormData({ zoneID: zones[0]?.zoneID || '', lotNumber: '', status: 'Available', isDisabledFriendly: false });
        setIsModalOpen(true);
    };

    const handleEdit = (item: any) => {
        setCurrentItem(item);
        setFormData({
            zoneID: item.zoneID,
            lotNumber: item.lotNumber,
            status: item.status,
            isDisabledFriendly: item.isDisabledFriendly
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (item: any) => {
        try {
            await fetchWithAuth(`/api/admin/lots/${item.lotID}`, { method: 'DELETE' });
            toast.success('Lot deleted successfully');
            loadData();
        } catch (error) { toast.error('Failed to delete lot'); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = currentItem ? `/api/admin/lots/${currentItem.lotID}` : '/api/admin/lots';
            const method = currentItem ? 'PUT' : 'POST';

            await fetchWithAuth(url, {
                method,
                body: JSON.stringify({
                    ...formData,
                    zoneID: parseInt(String(formData.zoneID))
                })
            });
            toast.success('Lot saved successfully');
            setIsModalOpen(false);
            loadData();
        } catch (error) { toast.error('Failed to save lot'); }
    };

    const columns = [

        { key: 'lotNumber', label: 'Number' },
        { key: 'zoneName', label: 'Zone' },
        {
            key: 'status', label: 'Status', render: (val: string) => (
                <span className={`px-2 py-1 rounded text-xs ${val === 'Available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {val}
                </span>
            )
        },
        { key: 'isDisabledFriendly', label: 'Disabled', render: (val: boolean) => val ? 'Yes' : 'No' },
    ];

    const tableData = lots.map(lot => ({
        ...lot,
        zoneName: lot.zone?.zoneName || '-'
    }));

    const zoneOptions = Array.from(new Set(zones.map(z => z.zoneName)));

    return (
        <>
            <AdminTable
                title="Parking Lots"
                columns={columns}
                data={tableData}
                filters={[
                    { key: 'status', label: 'Status', options: ['Available', 'Occupied', 'Reserved', 'Maintenance'] },
                    { key: 'zoneName', label: 'Zone', options: zoneOptions }
                ]}
                onAdd={handleAdd}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onRefresh={loadData}
                isLoading={loading}
            />

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={currentItem ? 'Edit Lot' : 'Add Lot'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Zone</label>
                        <select
                            className="w-full p-2 border border-gray-300 rounded mt-1"
                            value={formData.zoneID}
                            onChange={e => setFormData({ ...formData, zoneID: e.target.value })}
                            required
                        >
                            {zones.map(z => (
                                <option key={z.zoneID} value={z.zoneID}>{z.zoneName}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Lot Number</label>
                        <input
                            className="w-full p-2 border border-gray-300 rounded mt-1"
                            value={formData.lotNumber}
                            onChange={e => setFormData({ ...formData, lotNumber: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                        <select
                            className="w-full p-2 border border-gray-300 rounded mt-1"
                            value={formData.status}
                            onChange={e => setFormData({ ...formData, status: e.target.value })}
                        >
                            <option value="Available">Available</option>
                            <option value="Occupied">Occupied</option>
                            <option value="Reserved">Reserved</option>
                            <option value="Maintenance">Maintenance</option>
                        </select>
                    </div>
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            className="mr-2"
                            checked={formData.isDisabledFriendly}
                            onChange={e => setFormData({ ...formData, isDisabledFriendly: e.target.checked })}
                        />
                        <label className="text-sm font-medium text-gray-700">Disabled Friendly</label>
                    </div>
                    <button type="submit" className="w-full bg-cyan-600 text-white py-2 rounded hover:bg-cyan-700">
                        Save
                    </button>
                </form>
            </Modal>
        </>
    );
};

export default LotsView;
