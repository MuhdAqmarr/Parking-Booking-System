import React, { useState, useEffect } from 'react';
import AdminTable from './AdminTable';
import Modal from './Modal';
import { fetchWithAuth } from '../../utils/api';
import toast from 'react-hot-toast';

const VehiclesView: React.FC = () => {
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<any>(null);
    const [formData, setFormData] = useState({
        campusUserID: '',
        plateNum: '',
        vehicleType: 'Car',
        ownerName: '',
        ownerType: 'Student'
    });

    const loadData = async () => {
        setLoading(true);
        try {
            const [vData, uData] = await Promise.all([
                fetchWithAuth('/api/admin/vehicles'),
                fetchWithAuth('/api/admin/campus-users')
            ]);
            setVehicles(vData);
            setUsers(uData);
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    };

    useEffect(() => { loadData(); }, []);

    const handleAdd = () => {
        setCurrentItem(null);
        setFormData({ campusUserID: users[0]?.campusUserID || '', plateNum: '', vehicleType: 'Car', ownerName: '', ownerType: 'Student' });
        setIsModalOpen(true);
    };

    const handleEdit = (item: any) => {
        setCurrentItem(item);
        setFormData({
            campusUserID: item.campusUserID,
            plateNum: item.plateNum,
            vehicleType: item.vehicleType,
            ownerName: item.ownerName,
            ownerType: item.ownerType
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (item: any) => {
        try {
            await fetchWithAuth(`/api/admin/vehicles/${item.vehicleID}`, { method: 'DELETE' });
            toast.success('Vehicle deleted successfully');
            loadData();
        } catch (error) { toast.error('Failed to delete vehicle'); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = currentItem ? `/api/admin/vehicles/${currentItem.vehicleID}` : '/api/admin/vehicles';
            const method = currentItem ? 'PUT' : 'POST';

            // Auto-fill owner name/type from selected user if creating
            const selectedUser = users.find(u => u.campusUserID == formData.campusUserID);
            const payload = {
                ...formData,
                campusUserID: parseInt(String(formData.campusUserID)),
                ownerName: selectedUser?.fullName || formData.ownerName,
                ownerType: selectedUser?.userType || formData.ownerType
            };

            await fetchWithAuth(url, { method, body: JSON.stringify(payload) });
            toast.success('Vehicle saved successfully');
            setIsModalOpen(false);
            loadData();
        } catch (error) { toast.error('Failed to save vehicle'); }
    };

    const columns = [

        { key: 'plateNum', label: 'Plate' },
        { key: 'vehicleType', label: 'Type' },
        { key: 'ownerName', label: 'Owner' },
        { key: 'ownerType', label: 'Owner Type' },
    ];

    return (
        <>
            <AdminTable
                title="Vehicles"
                columns={columns}
                data={vehicles}
                filters={[
                    { key: 'vehicleType', label: 'Type', options: ['Car', 'Motorcycle', 'Truck'] },
                    { key: 'ownerType', label: 'Owner Type', options: ['Student', 'Staff', 'Visitor'] }
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
                title={currentItem ? 'Edit Vehicle' : 'Register Vehicle'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Owner (User)</label>
                        <select
                            className="w-full p-2 border border-gray-300 rounded mt-1"
                            value={formData.campusUserID}
                            onChange={e => setFormData({ ...formData, campusUserID: e.target.value })}
                            required
                        >
                            {users.map(u => (
                                <option key={u.campusUserID} value={u.campusUserID}>{u.fullName} ({u.userType})</option>
                            ))}
                        </select>
                    </div>
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
                        <label className="block text-sm font-medium text-gray-700">Type</label>
                        <select
                            className="w-full p-2 border border-gray-300 rounded mt-1"
                            value={formData.vehicleType}
                            onChange={e => setFormData({ ...formData, vehicleType: e.target.value })}
                        >
                            <option value="Car">Car</option>
                            <option value="Motorcycle">Motorcycle</option>
                            <option value="Truck">Truck</option>
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

export default VehiclesView;
