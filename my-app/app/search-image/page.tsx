'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import ImageUpload from '@/components/ImageUpload';
import AutoCard from '@/components/AutoCard';
import { Auto, ImageSearchResult } from '@/types';

// Dynamic import for modal
const AutoDetailModal = dynamic(() => import('@/components/AutoDetailModal'), {
    ssr: false,
});

export default function ImageSearchPage() {
    const [processing, setProcessing] = useState(false);
    const [result, setResult] = useState<ImageSearchResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [currentStep, setCurrentStep] = useState<number>(0);
    const [selectedAuto, setSelectedAuto] = useState<Auto | null>(null);

    const steps = [
        'Detecting vehicle...',
        'Extracting number plate...',
        'Searching database...',
    ];

    const handleImageUpload = async (file: File) => {
        setProcessing(true);
        setError(null);
        setResult(null);
        setCurrentStep(0);

        try {
            const formData = new FormData();
            formData.append('file', file);

            // Simulate step progression
            const stepInterval = setInterval(() => {
                setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
            }, 1500);

            const response = await fetch('/api/autos/search-by-image', {
                method: 'POST',
                body: formData,
            });

            clearInterval(stepInterval);
            setCurrentStep(steps.length);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to process image');
            }

            const data: ImageSearchResult = await response.json();
            setResult(data);
        } catch (err: any) {
            setError(err.message || 'An error occurred while processing the image');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="min-h-screen">
            {/* Header */}
            <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white py-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-20 [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
                <div className="container-custom relative z-10">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="text-blue-200 hover:text-white transition-colors bg-white/10 p-2 rounded-lg backdrop-blur-sm">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Image Search</h1>
                            <p className="text-blue-200 text-sm mt-1">
                                Upload a vehicle image to identify the auto and driver
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container-custom py-12">
                <div className="max-w-3xl mx-auto">
                    {/* Upload Section */}
                    <div className="mb-8">
                        <ImageUpload onUpload={handleImageUpload} maxSize={10 * 1024 * 1024} />
                    </div>

                    {/* Processing Steps */}
                    {processing && (
                        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8 mb-8 scale-in">
                            <h3 className="text-xl font-bold text-slate-800 mb-6 text-center">
                                Processing Image...
                            </h3>
                            <div className="space-y-4">
                                {steps.map((step, index) => (
                                    <div key={index} className="flex items-center gap-4">
                                        <div
                                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${index < currentStep
                                                ? 'bg-green-500 text-white shadow-lg shadow-green-200'
                                                : index === currentStep
                                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                                                    : 'bg-slate-100 text-slate-300'
                                                }`}
                                        >
                                            {index < currentStep ? (
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            ) : index === currentStep ? (
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            ) : (
                                                <span>{index + 1}</span>
                                            )}
                                        </div>
                                        <p
                                            className={`text-lg font-medium ${index <= currentStep ? 'text-slate-800' : 'text-slate-400'
                                                }`}
                                        >
                                            {step}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8 shadow-sm scale-in">
                            <div className="flex items-start gap-3">
                                <svg className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                    <h4 className="text-lg font-bold text-red-800 mb-1">Error</h4>
                                    <p className="text-red-700">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Results */}
                    {result && !processing && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                            {/* Extracted Info */}
                            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
                                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Extracted Vehicle Info
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                        <span className="text-slate-600 font-medium">Registration Number</span>
                                        <span className="badge bg-blue-100 text-blue-800 border-blue-200 font-mono text-xl font-bold tracking-wider px-4 py-1.5">
                                            {result.vehicleNumber}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between px-2">
                                        <span className="text-slate-600 font-medium flex items-center gap-2">
                                            AI Confidence Score
                                            <div className="group relative">
                                                <svg className="w-4 h-4 text-slate-400 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                                    Indicates how certain the AI is about the vehicle number reading.
                                                </div>
                                            </div>
                                        </span>
                                        <span className={`badge ${result.confidence > 0.8 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                            {(result.confidence * 100).toFixed(1)}% Accuracy
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Matched Autos */}
                            {result.matchedAutos.length > 0 ? (
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                                        <span className="w-2 h-8 bg-green-500 rounded-full"></span>
                                        Database Matches Found
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {result.matchedAutos.map((auto) => (
                                            <AutoCard
                                                key={auto._id?.toString()}
                                                auto={auto}
                                                onClick={setSelectedAuto}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8 text-center">
                                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-yellow-50 flex items-center justify-center">
                                        <svg className="w-10 h-10 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                    </div>
                                    <h4 className="text-xl font-bold text-slate-800 mb-2">No Match In Database</h4>
                                    <p className="text-slate-500 max-w-md mx-auto">
                                        The vehicle number <span className="font-mono font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">{result.vehicleNumber}</span> was detected, but no driver record exists for this number.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
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
