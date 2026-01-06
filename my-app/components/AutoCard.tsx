import Image from 'next/image';
import { Auto } from '@/types';
import { formatVehicleNumber } from '@/lib/utils/format';

interface AutoCardProps {
    auto: Auto;
    onClick?: (auto: Auto) => void;
}

export default function AutoCard({ auto, onClick }: AutoCardProps) {
    return (
        <div
            onClick={() => onClick?.(auto)}
            className="card card-hover overflow-hidden fade-in cursor-pointer hover:ring-2 hover:ring-blue-400/50 group"
        >
            {/* Auto Image */}
            <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                <Image
                    src={auto.imageUrl}
                    alt={`${auto.driverName}'s auto`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
            </div>

            {/* Card Content */}
            <div className="p-5 space-y-3">
                {/* Driver Name */}
                <h3 className="text-xl font-bold text-slate-900 truncate">
                    {auto.driverName}
                </h3>

                {/* Vehicle Number Badge */}
                <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="badge bg-blue-50 text-blue-700 border border-blue-100 font-mono text-base group-hover:bg-blue-600 group-hover:text-white group-hover:border-transparent transition-colors">
                        {formatVehicleNumber(auto.vehicleNumber)}
                    </span>
                </div>

                {/* Area/Zone */}
                <div className="flex items-center gap-2 text-slate-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-sm font-medium">{auto.area}</span>
                </div>
            </div>

            {/* Hover Effect Border */}
            <div className="absolute inset-0 border-2 border-transparent hover:border-blue-500 rounded-xl transition-colors pointer-events-none"></div>
        </div>
    );
}
