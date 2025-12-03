import React, { useState, useEffect } from 'react';
import AdminTable from './AdminTable';
import Modal from './Modal';
import { fetchWithAuth } from '../../utils/api';
import toast from 'react-hot-toast';

const FacultiesView: React.FC = () => {
    const [faculties, setFaculties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<any>(null);
    const [formData, setFormData] = useState({ facultyName: '', facultyCode: '', locationDesc: '' });

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await fetchWithAuth('/api/admin/faculties');
            setFaculties(data);
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    };

    useEffect(() => { loadData(); }, []);

    const handleAdd = () => {
        setCurrentItem(null);
        setFormData({ facultyName: '', facultyCode: '', locationDesc: '' });
        setIsModalOpen(true);
    };

    const handleEdit = (item: any) => {
        setCurrentItem(item);
        setFormData({
            facultyName: item.facultyName,
            facultyCode: item.facultyCode,
            locationDesc: item.locationDesc || ''
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (item: any) => {
        try {
            await fetchWithAuth(`/api/admin/faculties/${item.facultyID}`, { method: 'DELETE' });
            toast.success('Faculty deleted successfully');
            loadData();
        } catch (error) { toast.error('Failed to delete faculty'); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = currentItem
                ? `/api/admin/faculties/${currentItem.facultyID}`
                : '/api/admin/faculties';
            const method = currentItem ? 'PUT' : 'POST';

            await fetchWithAuth(url, {
                method,
                body: JSON.stringify(formData)
            });
            toast.success('Faculty saved successfully');
            setIsModalOpen(false);
            loadData();
        } catch (error) { toast.error('Failed to save faculty'); }
    };

    const columns = [

        { key: 'facultyName', label: 'Name' },
        { key: 'facultyCode', label: 'Code' },
        { key: 'locationDesc', label: 'Location' },
    ];

    return (
        <>
            <AdminTable
                title="Faculties"
                columns={columns}
                data={faculties}
                onAdd={handleAdd}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onRefresh={loadData}
                isLoading={loading}
            />

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={currentItem ? 'Edit Faculty' : 'Add Faculty'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <input
                            className="w-full p-2 border border-gray-300 rounded mt-1"
                            value={formData.facultyName}
                            onChange={e => setFormData({ ...formData, facultyName: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Code</label>
                        <input
                            className="w-full p-2 border border-gray-300 rounded mt-1"
                            value={formData.facultyCode}
                            onChange={e => setFormData({ ...formData, facultyCode: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Location</label>
                        <input
                            className="w-full p-2 border border-gray-300 rounded mt-1"
                            value={formData.locationDesc}
                            onChange={e => setFormData({ ...formData, locationDesc: e.target.value })}
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

export default FacultiesView;
