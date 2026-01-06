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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop with Blur */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Card */}
            <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden scale-in animate-in fade-in zoom-in-95 duration-200">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors backdrop-blur-md"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Header Image */}
                <div className="relative h-72 w-full bg-slate-100">
                    <Image
                        src={auto.imageUrl}
                        alt={`${auto.driverName}'s auto`}
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

                    {/* Floating Title (Bottom Left of Image) */}
                    <div className="absolute bottom-6 left-6 text-white">
                        <h2 className="text-3xl font-bold text-shadow">{auto.driverName}</h2>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="px-3 py-1 bg-green-500/90 text-white text-xs font-bold rounded-full uppercase tracking-wider backdrop-blur-sm">
                                Verified Driver
                            </span>
                        </div>
                    </div>
                </div>

                {/* Content Body */}
                <div className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Vehicle Number Section */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Vehicle Registration</label>
                            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <div className="text-2xl font-mono font-bold text-slate-900">
                                        {formatVehicleNumber(auto.vehicleNumber)}
                                    </div>
                                    <div className="text-xs text-slate-500">Official Registration Number</div>
                                </div>
                            </div>
                        </div>

                        {/* Area Section */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Zone / Area</label>
                            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <div className="text-xl font-bold text-slate-900">{auto.area}</div>
                                    <div className="text-xs text-slate-500">Operating Zone</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer / Actions */}
                    <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors"
                        >
                            Close Details
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
