'use client';

import { useState, useEffect } from 'react';

interface SearchBarProps {
    onSearch: (query: string, type: 'vehicleNumber' | 'driverName') => void;
    isLoading?: boolean;
}

export default function SearchBar({ onSearch, isLoading = false }: SearchBarProps) {
    const [query, setQuery] = useState('');
    const [searchType, setSearchType] = useState<'vehicleNumber' | 'driverName'>('vehicleNumber');

    // Debounced search
    useEffect(() => {
        if (query.length === 0) {
            onSearch('', searchType);
            return;
        }

        const timer = setTimeout(() => {
            onSearch(query, searchType);
        }, 300);

        return () => clearTimeout(timer);
    }, [query, searchType, onSearch]);

    const handleClear = () => {
        setQuery('');
    };

    return (
        <div className="glass rounded-2xl p-6 shadow-lg">
            <div className="flex flex-col md:flex-row gap-4">
                {/* Search Input */}
                <div className="flex-1 relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={`Search by ${searchType === 'vehicleNumber' ? 'vehicle number' : 'driver name'}...`}
                        className="input pl-12 pr-12"
                    />
                    {query && (
                        <button
                            onClick={handleClear}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                    {isLoading && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    )}
                </div>

                {/* Search Type Selector */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setSearchType('vehicleNumber')}
                        className={`px-6 py-3 rounded-lg font-semibold transition-all ${searchType === 'vehicleNumber'
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-white text-slate-700 hover:bg-slate-50'
                            }`}
                    >
                        Vehicle Number
                    </button>
                    <button
                        onClick={() => setSearchType('driverName')}
                        className={`px-6 py-3 rounded-lg font-semibold transition-all ${searchType === 'driverName'
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-white text-slate-700 hover:bg-slate-50'
                            }`}
                    >
                        Driver Name
                    </button>
                </div>
            </div>
        </div>
    );
}
