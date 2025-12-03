import React, { useState, useEffect } from 'react';
import AdminTable from './AdminTable';
import Modal from './Modal';
import { fetchWithAuth } from '../../utils/api';
import toast from 'react-hot-toast';

const PermitsView: React.FC = () => {
    const [permits, setPermits] = useState<any[]>([]);
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [zones, setZones] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<any>(null);
    const [formData, setFormData] = useState({
        vehicleID: '',
        zoneID: '',
        issueDate: '',
        expiryDate: '',
        status: 'Active'
    });

    const loadData = async () => {
        setLoading(true);
        try {
            const [pData, vData, zData] = await Promise.all([
                fetchWithAuth('/api/admin/permits'),
                fetchWithAuth('/api/admin/vehicles'),
                fetchWithAuth('/api/admin/zones')
            ]);
            setPermits(pData);
            setVehicles(vData);
            setZones(zData);
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    };

    useEffect(() => { loadData(); }, []);

    const handleAdd = () => {
        setCurrentItem(null);
        setFormData({
            vehicleID: vehicles[0]?.vehicleID || '',
            zoneID: zones[0]?.zoneID || '',
            issueDate: new Date().toISOString().split('T')[0],
            expiryDate: '',
            status: 'Active'
        });
        setIsModalOpen(true);
    };

    const handleEdit = (item: any) => {
        setCurrentItem(item);
        setFormData({
            vehicleID: item.vehicleID,
            zoneID: item.zoneID,
            issueDate: item.issueDate.split('T')[0],
            expiryDate: item.expiryDate.split('T')[0],
            status: item.status
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (item: any) => {
        try {
            await fetchWithAuth(`/api/admin/permits/${item.permitID}`, { method: 'DELETE' });
            toast.success('Permit deleted successfully');
            loadData();
        } catch (error) { toast.error('Failed to delete permit'); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = currentItem ? `/api/admin/permits/${currentItem.permitID}` : '/api/admin/permits';
            const method = currentItem ? 'PUT' : 'POST';

            await fetchWithAuth(url, {
                method,
                body: JSON.stringify({
                    ...formData,
                    vehicleID: parseInt(String(formData.vehicleID)),
                    zoneID: parseInt(String(formData.zoneID)),
                    issueDate: new Date(formData.issueDate),
                    expiryDate: new Date(formData.expiryDate)
                })
            });
            toast.success('Permit saved successfully');
            setIsModalOpen(false);
            loadData();
        } catch (error) { toast.error('Failed to save permit'); }
    };

    const columns = [

        { key: 'vehicle', label: 'Vehicle', render: (v: any) => v?.plateNum || '-' },
        { key: 'zone', label: 'Zone', render: (z: any) => z?.zoneName || '-' },
        { key: 'expiryDate', label: 'Expires', render: (d: string) => new Date(d).toLocaleDateString() },
        { key: 'status', label: 'Status' },
    ];

    return (
        <>
            <AdminTable
                title="Permits"
                columns={columns}
                data={permits}
                onAdd={handleAdd}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onRefresh={loadData}
                isLoading={loading}
            />

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={currentItem ? 'Edit Permit' : 'Issue Permit'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Vehicle</label>
                        <select
                            className="w-full p-2 border border-gray-300 rounded mt-1"
                            value={formData.vehicleID}
                            onChange={e => setFormData({ ...formData, vehicleID: e.target.value })}
                            required
                        >
                            {vehicles.map(v => (
                                <option key={v.vehicleID} value={v.vehicleID}>{v.plateNum}</option>
                            ))}
                        </select>
                    </div>
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
                        <label className="block text-sm font-medium text-gray-700">Issue Date</label>
                        <input
                            type="date"
                            className="w-full p-2 border border-gray-300 rounded mt-1"
                            value={formData.issueDate}
                            onChange={e => setFormData({ ...formData, issueDate: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
                        <input
                            type="date"
                            className="w-full p-2 border border-gray-300 rounded mt-1"
                            value={formData.expiryDate}
                            onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
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
                            <option value="Active">Active</option>
                            <option value="Expired">Expired</option>
                            <option value="Revoked">Revoked</option>
                        </select>
                    </div>
                    <button type="submit" className="w-full bg-cyan-600 text-white py-2 rounded hover:bg-cyan-700">
                        Save
                    </button>
                </form>
            </Modal>
        </>
    );
};

export default PermitsView;
