import React, { useState, useEffect } from 'react';
import AdminTable from './AdminTable';
import { fetchWithAuth } from '../../utils/api';
import toast from 'react-hot-toast';

const ReservationsView: React.FC = () => {
    const [reservations, setReservations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await fetchWithAuth('/api/admin/reservations');
            setReservations(data);
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    };

    useEffect(() => { loadData(); }, []);

    const handleStatusChange = async (id: number, status: string) => {
        if (!window.confirm(`Mark reservation as ${status}?`)) return;
        try {
            await fetchWithAuth(`/api/admin/reservations/${id}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ status })
            });
            toast.success(`Reservation marked as ${status}`);
            loadData();
        } catch (error) { toast.error('Failed to update status'); }
    };

    const columns = [
        { key: 'proofCode', label: 'Code' },
        { key: 'vehicle', label: 'Vehicle', render: (v: any) => v?.plateNum || '-' },
        { key: 'userInfo', label: 'User', render: (_: any, row: any) => row.vehicle?.campusUser?.fullName || row.vehicle?.ownerName || '-' },
        { key: 'lot', label: 'Lot', render: (l: any) => l?.lotNumber || '-' },
        { key: 'reservationDate', label: 'Date', render: (d: string) => new Date(d).toLocaleDateString() },
        {
            key: 'startTime',
            label: 'Time',
            render: (_: any, row: any) => {
                if (!row.startTime || !row.endTime) return '-';
                const start = new Date(row.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const end = new Date(row.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                return `${start} - ${end}`;
            }
        },
        {
            key: 'status', label: 'Status', render: (val: string) => {
                let colorClass = 'bg-gray-100 text-gray-800';
                if (val === 'Reserved') colorClass = 'bg-yellow-100 text-yellow-800';
                else if (val === 'CheckedIn') colorClass = 'bg-green-100 text-green-800';
                else if (val === 'Completed') colorClass = 'bg-blue-100 text-blue-800';
                else if (val === 'Cancelled') colorClass = 'bg-red-100 text-red-800';

                return (
                    <span className={`px-2 py-1 rounded text-xs ${colorClass}`}>
                        {val}
                    </span>
                );
            }
        },
    ];

    const actions = (item: any) => {
        const isActive = ['Reserved', 'CheckedIn'].includes(item.status);
        return (
            <div className="flex gap-2">
                <button
                    onClick={() => isActive && handleStatusChange(item.reservationID, 'Cancelled')}
                    disabled={!isActive}
                    className={`text-xs font-medium ${isActive ? 'text-red-600 hover:text-red-900' : 'text-gray-300 cursor-not-allowed'}`}
                >
                    Cancel
                </button>
                <button
                    onClick={() => isActive && handleStatusChange(item.reservationID, 'Completed')}
                    disabled={!isActive}
                    className={`text-xs font-medium ${isActive ? 'text-blue-600 hover:text-blue-900' : 'text-gray-300 cursor-not-allowed'}`}
                >
                    Complete
                </button>
            </div>
        );
    };

    return (
        <>
            <AdminTable
                title="Reservations"
                columns={columns}
                data={reservations}
                filters={[
                    { key: 'status', label: 'Status', options: ['Reserved', 'CheckedIn', 'Completed', 'Cancelled'] }
                ]}
                actions={actions}
                onRefresh={loadData}
                isLoading={loading}
                keyField="reservationID"
            />
        </>
    );
};

export default ReservationsView;
