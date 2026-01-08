'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ImageUpload from '@/components/ImageUpload';
import toast, { Toaster } from 'react-hot-toast';
import { Auto } from '@/types';
import AutoDetailModal from '@/components/AutoDetailModal';

export default function AdminDashboard() {
    const router = useRouter();
    // Extended form state
    const [formData, setFormData] = useState({
        driverName: '',
        vehicleNumber: '',
        licenseNumber: '',
        driverAddress: '',
        driverPhone: '',
        bloodGroup: '',
        emergencyContact: '',
        status: 'Active',
    });

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [recentAutos, setRecentAutos] = useState<Auto[]>([]);
    const [stats, setStats] = useState({ total: 0 });
    const [editingId, setEditingId] = useState<string | null>(null);
    const [selectedAuto, setSelectedAuto] = useState<Auto | null>(null);

    useEffect(() => {
        fetchRecentAutos();
    }, []);

    const fetchRecentAutos = async () => {
        try {
            const response = await fetch('/api/autos?page=1&limit=50');
            const data = await response.json();
            setRecentAutos(data.autos);
            setStats({ total: data.total });
        } catch (error) {
            console.error('Error fetching recent autos:', error);
            toast.error('Failed to load records');
        }
    };

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/admin', { method: 'DELETE' });
            toast.success('Secure logout successful');
            setTimeout(() => router.push('/'), 500);
        } catch (error) {
            toast.error('Logout failed');
        }
    };

    const handleEdit = (auto: Auto) => {
        setFormData({
            driverName: auto.driverName,
            vehicleNumber: auto.vehicleNumber,
            licenseNumber: auto.licenseNumber || '',
            driverAddress: auto.driverAddress || '',
            driverPhone: auto.driverPhone || '',
            bloodGroup: auto.bloodGroup || '',
            emergencyContact: auto.emergencyContact || '',
            status: auto.status || 'Active',
        });
        setEditingId(auto._id as unknown as string);
        setImageFile(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setFormData({
            driverName: '', vehicleNumber: '',
            licenseNumber: '',
            driverAddress: '', driverPhone: '',
            bloodGroup: '', emergencyContact: '', status: 'Active'
        });
        setEditingId(null);
        setImageFile(null);
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('CONFIRM DELETION: This action cannot be undone. Proceed?')) {
            return;
        }

        try {
            const response = await fetch(`/api/admin/autos/${id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Delete failed');

            toast.success('Record deleted successfully');
            fetchRecentAutos();
            if (editingId === id) handleCancelEdit();
        } catch (error) {
            toast.error('Error deleting record');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!editingId && !imageFile) {
            toast.error('Photo identification is mandatory');
            return;
        }

        setSubmitting(true);

        try {
            const formDataToSend = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                formDataToSend.append(key, value);
            });

            if (imageFile) {
                formDataToSend.append('image', imageFile);
            }

            const url = editingId ? `/api/admin/autos/${editingId}` : '/api/admin/autos';
            const method = editingId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                body: formDataToSend,
            });

            const data = await response.json();

            if (!response.ok) {
                toast.error(data.error || `Operation failed`);
                return;
            }

            toast.success(`Record ${editingId ? 'updated' : 'created'} successfully`);
            handleCancelEdit();
            fetchRecentAutos();
        } catch (error) {
            toast.error('System error. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    // Helper to handle vehicle number input
    const handleVehicleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.toUpperCase(); // Only keep uppercase for consistency, but allow spaces/chars
        setFormData({ ...formData, vehicleNumber: value });
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-amber-500/30">
            <Toaster position="top-right" toastOptions={{
                className: '!bg-slate-800 !text-white !border !border-slate-700',
                style: { background: '#1e293b', color: '#fff' }
            }} />

            {/* Top Navigation Bar */}
            <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 backdrop-blur-md bg-opacity-80">
                <div className="container-custom mx-auto px-4 md:px-6">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-amber-600 rounded flex items-center justify-center shadow-lg shadow-amber-900/20">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white tracking-tight">AUTOSCAN <span className="text-amber-500">ADMIN</span></h1>
                                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Department of Transport Safety</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="hidden md:block text-right">
                                <p className="text-sm font-medium text-white">Commissioner Access</p>
                                <p className="text-xs text-emerald-500 flex items-center justify-end gap-1">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                    System Online
                                </p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 bg-slate-800 hover:bg-red-900/50 text-slate-300 hover:text-red-400 text-sm font-medium rounded border border-slate-700 transition-all flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="container-custom mx-auto px-4 md:px-6 py-8">
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

                    {/* Left Column: Form (8 cols on XL) */}
                    <div className="xl:col-span-8 space-y-6">
                        <div className="bg-slate-900 rounded-lg border border-slate-800 shadow-xl overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-800 bg-slate-800/50 flex justify-between items-center">
                                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                    <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    {editingId ? 'UPDATE DRIVER RECORD' : 'NEW DRIVER REGISTRATION'}
                                </h2>
                                {editingId && (
                                    <button onClick={handleCancelEdit} className="text-xs font-semibold text-slate-400 hover:text-white uppercase tracking-wider">
                                        Cancel Operation
                                    </button>
                                )}
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 md:p-8">
                                <div className="space-y-6">
                                    {/* Consolidated Data Entry Grid */}
                                    <div>
                                        <h3 className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-4 border-b border-slate-800 pb-2">Record Information</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Row 1 */}
                                            <div>
                                                <label className="block text-xs font-medium text-slate-400 uppercase mb-1">Full Driver Name *</label>
                                                <input
                                                    type="text"
                                                    value={formData.driverName}
                                                    onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                                                    className="w-full bg-slate-950 border border-slate-700 rounded p-2.5 text-white focus:ring-1 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all placeholder-slate-700"
                                                    placeholder="ENTER FULL NAME"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-slate-400 uppercase mb-1">Status Classification</label>
                                                <select
                                                    value={formData.status}
                                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                                    className="w-full bg-slate-950 border border-slate-700 rounded p-2.5 text-white focus:ring-1 focus:ring-amber-500 focus:border-amber-500 outline-none"
                                                >
                                                    <option value="Active">ACTIVE</option>
                                                    <option value="Suspended">SUSPENDED</option>
                                                    <option value="Pending">PENDING VERIFICATION</option>
                                                </select>
                                            </div>

                                            {/* Row 2 */}
                                            <div>
                                                <label className="block text-xs font-medium text-slate-400 uppercase mb-1">Vehicle Registration *</label>
                                                <input
                                                    type="text"
                                                    value={formData.vehicleNumber}
                                                    onChange={handleVehicleNumberChange}
                                                    className="w-full bg-slate-950 border border-slate-700 rounded p-2.5 text-white font-mono text-lg tracking-wider focus:ring-1 focus:ring-amber-500 focus:border-amber-500 outline-none"
                                                    placeholder="KA00AA0000"
                                                    required
                                                />
                                                <p className="text-[10px] text-slate-500 mt-1">NO SPACES ALLOWED</p>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-slate-400 uppercase mb-1">Driver License No. *</label>
                                                <input
                                                    type="text"
                                                    value={formData.licenseNumber}
                                                    onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value.toUpperCase() })}
                                                    className="w-full bg-slate-950 border border-slate-700 rounded p-2.5 text-white font-mono focus:ring-1 focus:ring-amber-500 focus:border-amber-500 outline-none"
                                                    placeholder="DL-00-00000000000"
                                                    required
                                                />
                                            </div>

                                            {/* Row 3 */}
                                            <div>
                                                <label className="block text-xs font-medium text-slate-400 uppercase mb-1">Mobile Number *</label>
                                                <input
                                                    type="tel"
                                                    value={formData.driverPhone}
                                                    onChange={(e) => setFormData({ ...formData, driverPhone: e.target.value })}
                                                    className="w-full bg-slate-950 border border-slate-700 rounded p-2.5 text-white font-mono focus:ring-1 focus:ring-amber-500 focus:border-amber-500 outline-none"
                                                    placeholder="+91 00000 00000"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-slate-400 uppercase mb-1">Emergency Contact</label>
                                                <input
                                                    type="tel"
                                                    value={formData.emergencyContact}
                                                    onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                                                    className="w-full bg-slate-950 border border-slate-700 rounded p-2.5 text-white focus:ring-1 focus:ring-amber-500 focus:border-amber-500 outline-none"
                                                    placeholder="NUMBER"
                                                />
                                            </div>

                                            {/* Row 4 */}
                                            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
                                                <div className="md:col-span-2">
                                                    <label className="block text-xs font-medium text-slate-400 uppercase mb-1">Current Residential Address *</label>
                                                    <textarea
                                                        value={formData.driverAddress}
                                                        onChange={(e) => setFormData({ ...formData, driverAddress: e.target.value })}
                                                        className="w-full bg-slate-950 border border-slate-700 rounded p-2.5 text-white focus:ring-1 focus:ring-amber-500 focus:border-amber-500 outline-none min-h-[46px]"
                                                        placeholder="FULL ADDRESS WITH PINCODE"
                                                        rows={1}
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-slate-400 uppercase mb-1">Blood Group</label>
                                                    <select
                                                        value={formData.bloodGroup}
                                                        onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                                                        className="w-full bg-slate-950 border border-slate-700 rounded p-2.5 text-white focus:ring-1 focus:ring-amber-500 focus:border-amber-500 outline-none"
                                                    >
                                                        <option value="">Select</option>
                                                        {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                                                            <option key={bg} value={bg}>{bg}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            {/* Row 5: Image */}
                                            <div className="md:col-span-2">
                                                <label className="block text-xs font-medium text-slate-400 uppercase mb-1">Photo Identification {editingId ? '(Optional)' : '*'}</label>
                                                <div className="bg-slate-950/50 p-4 border border-slate-800 rounded-lg">
                                                    <ImageUpload
                                                        onUpload={(file) => setImageFile(file)}
                                                        maxSize={5 * 1024 * 1024}
                                                    />
                                                </div>
                                                {editingId && !imageFile && <p className="text-[10px] text-slate-500 mt-1 pl-1">Existing photo preserved</p>}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 pt-6 border-t border-slate-800 flex justify-end gap-4">
                                    {editingId && (
                                        <button
                                            type="button"
                                            onClick={handleCancelEdit}
                                            className="px-6 py-2.5 bg-transparent border border-slate-700 text-slate-300 font-semibold rounded hover:bg-slate-800 transition-colors uppercase text-sm tracking-wider"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="px-8 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded shadow-lg shadow-amber-900/30 transition-all uppercase text-sm tracking-wider flex items-center gap-2"
                                    >
                                        {submitting ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                {editingId ? 'Update System Record' : 'Register Driver'}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Right Column: List (4 cols on XL) */}
                    <div className="xl:col-span-4 space-y-6">
                        {/* Stats Panel */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
                                <h3 className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Total Records</h3>
                                <p className="text-3xl font-bold text-white mt-1">{stats.total}</p>
                            </div>
                            <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
                                <h3 className="text-xs text-slate-500 uppercase tracking-widest font-semibold">System Status</h3>
                                <p className="text-sm font-bold text-emerald-500 mt-2 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                                    OPERATIONAL
                                </p>
                            </div>
                        </div>

                        {/* Recent Records List */}
                        <div className="bg-slate-900 border border-slate-800 rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[calc(100vh-200px)]">
                            <div className="px-4 py-3 border-b border-slate-800 bg-slate-800/50 flex justify-between items-center">
                                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Recent Entries</h3>
                                <span className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">Last 50</span>
                            </div>

                            <div className="overflow-y-auto flex-1 p-2 space-y-2">
                                {recentAutos.length > 0 ? (
                                    recentAutos.map((auto) => (
                                        <div
                                            key={auto._id?.toString()}
                                            onClick={() => setSelectedAuto(auto)}
                                            className="bg-slate-950/50 border border-slate-800/50 hover:border-amber-900/50 hover:bg-slate-900 p-3 rounded cursor-pointer transition-all group"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="w-12 h-12 rounded bg-slate-800 flex-shrink-0 overflow-hidden border border-slate-700">
                                                    {auto.imageUrl ? (
                                                        <img src={auto.imageUrl} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-600">
                                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start">
                                                        <h4 className="font-bold text-slate-200 truncate group-hover:text-amber-500 transition-colors">{auto.vehicleNumber}</h4>
                                                        <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold ${auto.status === 'Suspended' ? 'bg-red-900/30 text-red-500' :
                                                            auto.status === 'Pending' ? 'bg-amber-900/30 text-amber-500' :
                                                                'bg-emerald-900/30 text-emerald-500'
                                                            }`}>
                                                            {auto.status || 'Active'}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-slate-400 truncate">{auto.driverName}</p>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleEdit(auto); }}
                                                            className="text-xs text-blue-400 hover:text-blue-300 font-medium uppercase tracking-wide hover:underline"
                                                        >
                                                            Edit
                                                        </button>
                                                        <span className="text-slate-700">|</span>
                                                        <button
                                                            onClick={(e) => handleDelete(auto._id as unknown as string, e)}
                                                            className="text-xs text-red-400 hover:text-red-300 font-medium uppercase tracking-wide hover:underline"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-8 text-center text-slate-600 text-sm">
                                        No records found in database.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Modal for viewing details (read-only view) */}
            {selectedAuto && (
                <AutoDetailModal
                    auto={selectedAuto}
                    onClose={() => setSelectedAuto(null)}
                />
            )}
        </div>
    );
}
