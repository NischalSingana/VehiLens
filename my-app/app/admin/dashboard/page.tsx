'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ImageUpload from '@/components/ImageUpload';
import toast, { Toaster } from 'react-hot-toast';
import { Auto } from '@/types';

export default function AdminDashboard() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        driverName: '',
        vehicleNumber: '',
        area: '',
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [recentAutos, setRecentAutos] = useState<Auto[]>([]);
    const [stats, setStats] = useState({ total: 0 });
    const [editingId, setEditingId] = useState<string | null>(null);

    useEffect(() => {
        fetchRecentAutos();
    }, []);

    const fetchRecentAutos = async () => {
        try {
            // Fetch more records to allow easier management
            const response = await fetch('/api/autos?page=1&limit=50');
            const data = await response.json();
            setRecentAutos(data.autos);
            setStats({ total: data.total });
        } catch (error) {
            console.error('Error fetching recent autos:', error);
        }
    };

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/admin', { method: 'DELETE' });
            toast.success('Logged out successfully');
            setTimeout(() => router.push('/'), 500);
        } catch (error) {
            toast.error('Logout failed');
        }
    };

    const handleEdit = (auto: Auto) => {
        setFormData({
            driverName: auto.driverName,
            vehicleNumber: auto.vehicleNumber,
            area: auto.area,
        });
        setEditingId(auto._id as unknown as string);
        setImageFile(null); // Keep existing image by default unless user uploads new one
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setFormData({ driverName: '', vehicleNumber: '', area: '' });
        setEditingId(null);
        setImageFile(null);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this record? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`/api/admin/autos/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const data = await response.json();
                toast.error(data.error || 'Failed to delete record');
                return;
            }

            toast.success('Record deleted successfully');
            fetchRecentAutos();

            // If deleting the currently editing item, reset form
            if (editingId === id) {
                handleCancelEdit();
            }
        } catch (error) {
            toast.error('Error deleting record');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Image validation only for new records
        if (!editingId && !imageFile) {
            toast.error('Please upload an auto image');
            return;
        }

        setSubmitting(true);

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('driverName', formData.driverName);
            formDataToSend.append('vehicleNumber', formData.vehicleNumber);
            formDataToSend.append('area', formData.area);
            if (imageFile) {
                formDataToSend.append('image', imageFile);
            }

            const url = editingId
                ? `/api/admin/autos/${editingId}`
                : '/api/admin/autos';

            const method = editingId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                body: formDataToSend,
            });

            const data = await response.json();

            if (!response.ok) {
                toast.error(data.error || `Failed to ${editingId ? 'update' : 'add'} auto record`);
                return;
            }

            toast.success(`Auto record ${editingId ? 'updated' : 'added'} successfully!`);

            // Reset form
            handleCancelEdit();

            // Refresh recent autos
            fetchRecentAutos();
        } catch (error) {
            toast.error('An error occurred. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Toaster position="top-center" />

            {/* Header */}
            <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white py-6">
                <div className="container-custom">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                            <p className="text-blue-200 text-sm mt-1">Manage auto and driver records</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="btn bg-red-600 text-white hover:bg-red-700"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            <div className="container-custom py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Form Section */}
                    <div className="lg:col-span-1">
                        <div className="card p-8 sticky top-8">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-slate-900">
                                    {editingId ? 'Edit Auto Record' : 'Add New Auto Record'}
                                </h2>
                                {editingId && (
                                    <button
                                        onClick={handleCancelEdit}
                                        className="text-sm text-slate-500 hover:text-slate-700 underline"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Driver Name */}
                                <div>
                                    <label htmlFor="driverName" className="block text-sm font-semibold text-slate-700 mb-2">
                                        Driver Name *
                                    </label>
                                    <input
                                        id="driverName"
                                        type="text"
                                        value={formData.driverName}
                                        onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                                        className="input"
                                        placeholder="e.g., Rajesh Kumar"
                                        required
                                    />
                                </div>

                                {/* Vehicle Number */}
                                <div>
                                    <label htmlFor="vehicleNumber" className="block text-sm font-semibold text-slate-700 mb-2">
                                        Vehicle Number *
                                    </label>
                                    <input
                                        id="vehicleNumber"
                                        type="text"
                                        value={formData.vehicleNumber}
                                        onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value.toUpperCase() })}
                                        className="input font-mono"
                                        placeholder="e.g., KA 01 AB 1234"
                                        required
                                    />
                                    <p className="text-xs text-slate-500 mt-1">Format: XX 00 XX 0000</p>
                                </div>

                                {/* Area */}
                                <div>
                                    <label htmlFor="area" className="block text-sm font-semibold text-slate-700 mb-2">
                                        Area / Zone *
                                    </label>
                                    <input
                                        id="area"
                                        type="text"
                                        value={formData.area}
                                        onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                                        className="input"
                                        placeholder="e.g., Jayanagar, Bangalore"
                                        required
                                    />
                                </div>

                                {/* Image Upload */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Auto Image {editingId ? '(Optional)' : '*'}
                                    </label>
                                    <ImageUpload
                                        onUpload={(file) => setImageFile(file)}
                                        maxSize={5 * 1024 * 1024}
                                    />
                                    {editingId && !imageFile && (
                                        <p className="text-xs text-blue-600 mt-1">Current image will be kept if new one not uploaded</p>
                                    )}
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className={`btn w-full disabled:opacity-50 disabled:cursor-not-allowed ${editingId ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'btn-primary'}`}
                                >
                                    {submitting ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            {editingId ? 'Updating...' : 'Adding Record...'}
                                        </>
                                    ) : (
                                        <>
                                            {editingId ? (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            ) : (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                </svg>
                                            )}
                                            {editingId ? 'Update Record' : 'Add Auto Record'}
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Sidebar / List Section */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Stats Card */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="card p-6 border-l-4 border-blue-600">
                                <h3 className="text-sm font-semibold text-slate-500 uppercase">Total Records</h3>
                                <p className="text-3xl font-bold text-slate-900 mt-2">{stats.total}</p>
                            </div>
                        </div>

                        {/* Recent Additions */}
                        <div className="card p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-slate-900">Manage Records</h3>
                                <div className="text-sm text-slate-500">Showing last 50</div>
                            </div>

                            {recentAutos.length > 0 ? (
                                <div className="space-y-4">
                                    {recentAutos.map((auto) => (
                                        <div key={auto._id?.toString()} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex items-center gap-4">
                                                {auto.imageUrl && (
                                                    <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-200 flex-shrink-0">
                                                        <img src={auto.imageUrl} alt="Auto" className="w-full h-full object-cover" />
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-bold text-slate-900">{auto.vehicleNumber}</p>
                                                    <p className="text-sm text-slate-600">{auto.driverName}</p>
                                                    <p className="text-xs text-slate-400">{auto.area}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleEdit(auto)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit Record"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(auto._id as unknown as string)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete Record"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-lg">
                                    <p>No records found. Add your first record above.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
