import React, { useState, useEffect } from 'react';
import AdminTable from './AdminTable';
import Modal from './Modal';
import CustomSelect from '../ui/CustomSelect';
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

    const zoneSelectOptions = zones.map(z => ({
        value: z.zoneID,
        label: z.zoneName
    }));

    const statusOptions = [
        { value: 'Available', label: 'Available', badges: [{ text: 'Available', color: 'green' as const }] },
        { value: 'Occupied', label: 'Occupied', badges: [{ text: 'Occupied', color: 'red' as const }] },
        { value: 'Reserved', label: 'Reserved', badges: [{ text: 'Reserved', color: 'orange' as const }] },
        { value: 'Maintenance', label: 'Maintenance', badges: [{ text: 'Maintenance', color: 'gray' as const }] }
    ];

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
                    <CustomSelect
                        label="Zone"
                        value={formData.zoneID}
                        onChange={(val) => setFormData({ ...formData, zoneID: String(val) })}
                        options={zoneSelectOptions}
                        required
                    />
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Lot Number</label>
                        <input
                            className="w-full p-2 border border-gray-300 rounded mt-1"
                            value={formData.lotNumber}
                            onChange={e => setFormData({ ...formData, lotNumber: e.target.value })}
                            required
                        />
                    </div>
                    <CustomSelect
                        label="Status"
                        value={formData.status}
                        onChange={(val) => setFormData({ ...formData, status: String(val) })}
                        options={statusOptions}
                    />
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
