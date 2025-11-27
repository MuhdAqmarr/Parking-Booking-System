import React, { useState, useEffect } from 'react';
import AdminTable from './AdminTable';
import Modal from './Modal';
import { fetchWithAuth } from '../../utils/api';
import toast from 'react-hot-toast';

const ZonesView: React.FC = () => {
    const [zones, setZones] = useState<any[]>([]);
    const [faculties, setFaculties] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<any>(null);
    const [formData, setFormData] = useState({
        facultyID: '',
        zoneName: '',
        zoneType: 'Student',
        capacity: 0
    });

    const loadData = async () => {
        try {
            const [zData, fData] = await Promise.all([
                fetchWithAuth('/api/admin/zones'),
                fetchWithAuth('/api/admin/faculties')
            ]);
            setZones(zData);
            setFaculties(fData);
        } catch (error) { console.error(error); }
    };

    useEffect(() => { loadData(); }, []);

    const handleAdd = () => {
        setCurrentItem(null);
        setFormData({ facultyID: faculties[0]?.facultyID || '', zoneName: '', zoneType: 'Student', capacity: 10 });
        setIsModalOpen(true);
    };

    const handleEdit = (item: any) => {
        setCurrentItem(item);
        setFormData({
            facultyID: item.facultyID,
            zoneName: item.zoneName,
            zoneType: item.zoneType,
            capacity: item.capacity
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (item: any) => {
        try {
            await fetchWithAuth(`/api/admin/zones/${item.zoneID}`, { method: 'DELETE' });
            toast.success('Zone deleted successfully');
            loadData();
        } catch (error) { toast.error('Failed to delete zone'); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = currentItem ? `/api/admin/zones/${currentItem.zoneID}` : '/api/admin/zones';
            const method = currentItem ? 'PUT' : 'POST';

            await fetchWithAuth(url, {
                method,
                body: JSON.stringify({
                    ...formData,
                    facultyID: parseInt(String(formData.facultyID)),
                    capacity: parseInt(String(formData.capacity))
                })
            });
            toast.success('Zone saved successfully');
            setIsModalOpen(false);
            loadData();
        } catch (error) { toast.error('Failed to save zone'); }
    };

    const columns = [

        { key: 'zoneName', label: 'Name' },
        { key: 'zoneType', label: 'Type' },
        { key: 'capacity', label: 'Capacity' },
        { key: 'occupancyRate', label: 'Occupancy %', render: (val: number) => `${val.toFixed(1)}%` },
    ];

    return (
        <>
            <AdminTable
                title="Parking Zones"
                columns={columns}
                data={zones}
                onAdd={handleAdd}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={currentItem ? 'Edit Zone' : 'Add Zone'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Faculty</label>
                        <select
                            className="w-full p-2 border border-gray-300 rounded mt-1"
                            value={formData.facultyID}
                            onChange={e => setFormData({ ...formData, facultyID: e.target.value })}
                            required
                        >
                            {faculties.map(f => (
                                <option key={f.facultyID} value={f.facultyID}>{f.facultyName}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <input
                            className="w-full p-2 border border-gray-300 rounded mt-1"
                            value={formData.zoneName}
                            onChange={e => setFormData({ ...formData, zoneName: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Type</label>
                        <select
                            className="w-full p-2 border border-gray-300 rounded mt-1"
                            value={formData.zoneType}
                            onChange={e => setFormData({ ...formData, zoneType: e.target.value })}
                        >
                            <option value="Student">Student</option>
                            <option value="Staff">Staff</option>
                            <option value="Visitor">Visitor</option>
                            <option value="Disabled">Disabled</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Capacity</label>
                        <input
                            type="number"
                            className="w-full p-2 border border-gray-300 rounded mt-1"
                            value={formData.capacity}
                            onChange={e => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                            required
                        />
                    </div>
                    <button type="submit" className="w-full bg-cyan-600 text-white py-2 rounded hover:bg-cyan-700">
                        Save
                    </button>
                </form>
            </Modal>
        </>
    );
};

export default ZonesView;
