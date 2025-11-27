import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import Modal from './Modal';

interface Column {
    key: string;
    label: string;
    render?: (value: any, row: any) => React.ReactNode;
}

interface FilterConfig {
    key: string;
    label: string;
    options: string[];
}

interface AdminTableProps {
    title: string;
    columns: Column[];
    data: any[];
    filters?: FilterConfig[];
    onAdd?: () => void;
    onEdit?: (item: any) => void;
    onDelete?: (item: any) => void;
    actions?: (item: any) => React.ReactNode;
}

const AdminTable: React.FC<AdminTableProps> = ({ title, columns, data, filters, onAdd, onEdit, onDelete, actions }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [itemToDelete, setItemToDelete] = useState<any>(null);
    const itemsPerPage = 10;

    // Filter Logic
    const filteredData = data.filter((row) => {
        // 1. Search Term
        const matchesSearch = JSON.stringify(Object.values(row)).toLowerCase().includes(searchTerm.toLowerCase());

        // 2. Dropdown Filters
        const matchesFilters = filters ? filters.every(filter => {
            const selectedValue = activeFilters[filter.key];
            if (!selectedValue) return true; // No filter selected
            return String(row[filter.key]) === selectedValue;
        }) : true;

        return matchesSearch && matchesFilters;
    });

    // Pagination Logic
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handleFilterChange = (key: string, value: string) => {
        setActiveFilters(prev => ({ ...prev, [key]: value }));
        setCurrentPage(1);
    };

    const confirmDelete = () => {
        if (onDelete && itemToDelete) {
            onDelete(itemToDelete);
            setItemToDelete(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                        {filters?.map(filter => (
                            <select
                                key={filter.key}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white text-sm w-full sm:w-auto"
                                value={activeFilters[filter.key] || ''}
                                onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                            >
                                <option value="">All {filter.label}</option>
                                {filter.options.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        ))}
                    </div>

                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent w-full"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>
                    {onAdd && (
                        <button
                            onClick={onAdd}
                            className="bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 transition-colors flex items-center justify-center gap-2 whitespace-nowrap w-full sm:w-auto"
                        >
                            <Plus className="w-4 h-4" />
                            Add New
                        </button>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                                    #
                                </th>
                                {columns.map((col) => (
                                    <th key={col.key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {col.label}
                                    </th>
                                ))}
                                {(onEdit || onDelete || actions) && (
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {paginatedData.map((row, idx) => (
                                <tr key={row.id || row[columns[0].key] || idx} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {startIndex + idx + 1}
                                    </td>
                                    {columns.map((col) => (
                                        <td key={col.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {col.render ? col.render(row[col.key], row) : row[col.key]}
                                        </td>
                                    ))}
                                    {(onEdit || onDelete || actions) && (
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end gap-2">
                                            {actions && actions(row)}
                                            {onEdit && (
                                                <button onClick={() => onEdit(row)} className="text-cyan-600 hover:text-cyan-900">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                            )}
                                            {onDelete && (
                                                <button onClick={() => setItemToDelete(row)} className="text-red-600 hover:text-red-900">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            ))}
                            {paginatedData.length === 0 && (
                                <tr>
                                    <td colSpan={columns.length + (onEdit || onDelete || actions ? 1 : 0)} className="px-6 py-8 text-center text-gray-500">
                                        No data found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {filteredData.length > 0 && (
                    <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50">
                        <div className="text-sm text-gray-500 text-center sm:text-left">
                            Showing <span className="font-medium">{startIndex + 1}</span> to <span className="font-medium">{Math.min(startIndex + itemsPerPage, filteredData.length)}</span> of <span className="font-medium">{filteredData.length}</span> results
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed bg-white"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed bg-white"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <Modal
                isOpen={!!itemToDelete}
                onClose={() => setItemToDelete(null)}
                title="Confirm Delete"
            >
                <div className="space-y-4">
                    <p className="text-gray-600">Are you sure you want to delete this record? This action cannot be undone.</p>
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => setItemToDelete(null)}
                            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={confirmDelete}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default AdminTable;
