import { useEffect } from 'react';
import Image from 'next/image';
import { Auto } from '@/types';
import { formatVehicleNumber } from '@/lib/utils/format';

interface AutoDetailModalProps {
    auto: Auto;
    onClose: () => void;
}

export default function AutoDetailModal({ auto, onClose }: AutoDetailModalProps) {
    // Prevent scrolling when modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    // Format helpers
    const formatDate = (date: Date) => new Date(date).toLocaleDateString();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop with Blur */}
            <div
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Card - ID Card Style */}
            <div className="relative w-full max-w-4xl bg-white rounded-lg shadow-2xl overflow-hidden scale-in animate-in fade-in zoom-in-95 duration-200 border-t-8 border-amber-600">
                {/* ID Header */}
                <div className="bg-slate-900 px-6 py-4 flex justify-between items-center text-white">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-amber-600 rounded flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold tracking-wide">DRIVER RECORD SHEET</h2>
                            <p className="text-[10px] text-slate-400 uppercase tracking-widest">Official Government Registry</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white transition-colors p-1"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex flex-col md:flex-row h-full max-h-[80vh] overflow-y-auto">
                    {/* Left Panel: Photo & status */}
                    <div className="w-full md:w-1/3 bg-slate-50 p-6 border-b md:border-b-0 md:border-r border-slate-200 flex flex-col items-center text-center">
                        <div className="aspect-[3/4] relative w-full rounded-lg overflow-hidden border-2 border-slate-300 shadow-inner mb-6 bg-slate-200">
                            <Image
                                src={auto.imageUrl}
                                alt={`${auto.driverName}'s photo`}
                                fill
                                className="object-cover"
                            />
                            <div className="absolute top-0 right-0 m-2">
                                <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded shadow-sm ${auto.status === 'Active' ? 'bg-green-600 text-white' :
                                        auto.status === 'Suspended' ? 'bg-red-600 text-white' : 'bg-amber-500 text-white'
                                    }`}>
                                    {auto.status || 'Active'}
                                </span>
                            </div>
                        </div>

                        <div className="w-full space-y-4">
                            <div>
                                <h3 className="text-2xl font-bold text-slate-900 leading-tight">{auto.driverName}</h3>
                                <p className="text-sm text-slate-500 font-mono mt-1">ID: {auto._id?.toString().slice(-8).toUpperCase()}</p>
                            </div>

                            <div className="p-4 bg-slate-900 text-white rounded-lg shadow-lg w-full">
                                <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Vehicle Registration</p>
                                <p className="text-2xl font-mono font-bold text-amber-500 tracking-wider break-all">{formatVehicleNumber(auto.vehicleNumber)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Data Grid */}
                    <div className="w-full md:w-2/3 p-8 bg-white flex flex-col">
                        <div className="flex-1">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 mb-6">Driver & Vehicle Particulars</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-8">
                                <div>
                                    <p className="text-[10px] text-slate-500 uppercase font-semibold">License Number</p>
                                    <p className="text-lg font-mono font-medium text-slate-900 mt-1 border-b border-dashed border-slate-200 pb-1">{auto.licenseNumber || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-500 uppercase font-semibold">Blood Group</p>
                                    <p className="text-lg font-medium text-red-600 mt-1 border-b border-dashed border-slate-200 pb-1">{auto.bloodGroup || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-500 uppercase font-semibold">Driver Mobile</p>
                                    <p className="text-lg font-mono font-medium text-slate-900 mt-1 border-b border-dashed border-slate-200 pb-1">{auto.driverPhone || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-500 uppercase font-semibold">Emergency Contact</p>
                                    <p className="text-lg font-mono font-medium text-slate-900 mt-1 border-b border-dashed border-slate-200 pb-1">{auto.emergencyContact || 'N/A'}</p>
                                </div>
                                <div className="md:col-span-2">
                                    <p className="text-[10px] text-slate-500 uppercase font-semibold">Residential Address</p>
                                    <p className="text-base font-medium text-slate-900 mt-1 leading-relaxed bg-slate-50 p-3 rounded border border-slate-100">{auto.driverAddress || 'N/A'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-4 border-t border-slate-100 flex justify-between items-end">
                            <div className="text-xs text-slate-400">
                                <p>Record created: {auto.createdAt ? formatDate(auto.createdAt) : 'N/A'}</p>
                                <p>Last updated: {auto.updatedAt ? formatDate(auto.updatedAt) : 'N/A'}</p>
                            </div>
                            <div className="text-right">
                                <div className="w-24 h-8 bg-slate-100 rounded border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-400 uppercase tracking-widest transform rotate-[-5deg] opacity-50">
                                    Official
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
