import React, { useState, useEffect } from 'react';
import AdminTable from './AdminTable';
import Modal from './Modal';
import { fetchWithAuth } from '../../utils/api';
import toast from 'react-hot-toast';

const UsersView: React.FC = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<any>(null);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        status: 'Active'
    });

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await fetchWithAuth('/api/admin/campus-users');
            setUsers(data);
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    };

    useEffect(() => { loadData(); }, []);

    const handleEdit = (item: any) => {
        setCurrentItem(item);
        setFormData({
            fullName: item.fullName,
            email: item.email,
            status: item.status
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await fetchWithAuth(`/api/admin/campus-users/${currentItem.campusUserID}`, {
                method: 'PUT',
                body: JSON.stringify(formData)
            });
            toast.success('User updated successfully');
            setIsModalOpen(false);
            loadData();
        } catch (error) { toast.error('Failed to update user'); }
    };

    const handleDelete = async (item: any) => {
        try {
            await fetchWithAuth(`/api/admin/campus-users/${item.campusUserID}`, { method: 'DELETE' });
            toast.success('User deleted successfully');
            loadData();
        } catch (error) { toast.error('Failed to delete user'); }
    };

    const columns = [

        { key: 'fullName', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'faculty', label: 'Faculty', render: (val: any) => val?.facultyName || '-' },
        { key: 'userType', label: 'Type' },
        {
            key: 'status', label: 'Status', render: (val: string) => (
                <span className={`px-2 py-1 rounded text-xs ${val === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {val}
                </span>
            )
        },
    ];

    return (
        <>
            <AdminTable
                title="Campus Users"
                columns={columns}
                data={users}
                filters={[
                    { key: 'status', label: 'Status', options: ['Active', 'Inactive', 'Suspended'] },
                    { key: 'userType', label: 'Type', options: ['Student', 'Staff', 'Visitor'] }
                ]}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onRefresh={loadData}
                isLoading={loading}
            />

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Edit User"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <input
                            className="w-full p-2 border border-gray-300 rounded mt-1 bg-gray-100"
                            value={formData.fullName}
                            readOnly
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            className="w-full p-2 border border-gray-300 rounded mt-1 bg-gray-100"
                            value={formData.email}
                            readOnly
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
                            <option value="Inactive">Inactive</option>
                            <option value="Suspended">Suspended</option>
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

export default UsersView;
