'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import AutoCard from '@/components/AutoCard';
import SearchBar from '@/components/SearchBar';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import { Auto } from '@/types';

// Dynamic import for the modal to ensure client-side rendering
const AutoDetailModal = dynamic(() => import('@/components/AutoDetailModal'), {
  ssr: false,
});

export default function Home() {
  const [autos, setAutos] = useState<Auto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchActive, setSearchActive] = useState(false);
  const [selectedAuto, setSelectedAuto] = useState<Auto | null>(null);

  // Fetch all autos with pagination
  const fetchAutos = async (pageNum: number = 1) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/autos?page=${pageNum}&limit=20`);
      const data = await response.json();

      setAutos(data.autos);
      setTotalPages(data.totalPages);
      setPage(pageNum);
    } catch (error) {
      console.error('Error fetching autos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = useCallback(async (query: string, type: 'vehicleNumber' | 'driverName') => {
    if (!query) {
      setSearchActive(false);
      fetchAutos(1);
      return;
    }

    try {
      setSearching(true);
      setSearchActive(true);
      const response = await fetch(`/api/autos/search?q=${encodeURIComponent(query)}&type=${type}`);
      const data = await response.json();

      setAutos(data.autos);
      setTotalPages(1); // Search results don't have pagination
    } catch (error) {
      console.error('Error searching autos:', error);
    } finally {
      setSearching(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchAutos();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white py-16 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-20 [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>

        <div className="container-custom relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="fade-in">
              <h1 className="text-4xl md:text-6xl font-extrabold mb-4 tracking-tight">
                Auto<span className="text-blue-400">Scan</span> Pro
              </h1>
              <p className="text-xl text-blue-100 font-light max-w-lg">
                Advanced Vehicle & Driver Identification System for Authorities
              </p>
              <div className="mt-4 flex gap-3 text-sm text-blue-300">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                  Encrypted Database
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                  Real-time Updates
                </span>
              </div>
            </div>

            <div className="flex gap-4 fade-in" style={{ animationDelay: '0.2s' }}>
              <Link
                href="/search-image"
                className="btn bg-white text-slate-900 hover:bg-blue-50 shadow-lg shadow-blue-900/20 border border-white/20"
              >
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                ID by Image
              </Link>

              <Link
                href="/admin/login"
                className="btn bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/30 border border-transparent"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Admin Panel
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-custom py-12 relative min-h-[600px]">
        {/* Search Bar */}
        <div className="mb-10 max-w-3xl mx-auto -mt-24 relative z-20">
          <div className="bg-white/90 backdrop-blur-md p-2 rounded-2xl shadow-xl shadow-slate-900/10 border border-white/20">
            <SearchBar onSearch={handleSearch} isLoading={searching} />
          </div>
        </div>

        {/* Results Count */}
        {!loading && (
          <div className="mb-6 flex items-center justify-between">
            <p className="text-slate-600 font-medium">
              {searchActive ? (
                <>Found <span className="text-slate-900 font-bold text-lg">{autos.length}</span> result{autos.length !== 1 ? 's' : ''}</>
              ) : (
                <>Recent Records</>
              )}
            </p>
          </div>
        )}

        {/* Auto Cards Grid */}
        {loading ? (
          <LoadingSkeleton />
        ) : autos.length > 0 ? (
          <div className="grid-auto-cards">
            {autos.map((auto) => (
              <AutoCard
                key={auto._id?.toString()}
                auto={auto}
                onClick={setSelectedAuto}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-slate-100">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-slate-50 flex items-center justify-center">
              <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">No records found</h3>
            <p className="text-slate-500 max-w-sm mx-auto">
              {searchActive
                ? 'We couldn\'t find any vehicles matching your search. Try a different number or name.'
                : 'No auto records in the database yet.'}
            </p>
          </div>
        )}

        {/* Pagination */}
        {!searchActive && totalPages > 1 && (
          <div className="mt-16 flex justify-center gap-2">
            <button
              onClick={() => fetchAutos(page - 1)}
              disabled={page === 1}
              className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <div className="flex items-center gap-2 px-4">
              <span className="text-slate-700 font-medium">
                Page {page} of {totalPages}
              </span>
            </div>

            <button
              onClick={() => fetchAutos(page + 1)}
              disabled={page === totalPages}
              className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedAuto && (
        <AutoDetailModal
          auto={selectedAuto}
          onClose={() => setSelectedAuto(null)}
        />
      )}
    </div>
  );
}
