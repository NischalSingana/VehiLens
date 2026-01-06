'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

interface ImageUploadProps {
    onUpload: (file: File) => void;
    maxSize?: number; // in bytes
    accept?: string[];
}

export default function ImageUpload({
    onUpload,
    maxSize = 10 * 1024 * 1024, // 10MB default
    accept = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
}: ImageUploadProps) {
    const [preview, setPreview] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
        setError(null);

        if (rejectedFiles.length > 0) {
            const rejection = rejectedFiles[0];
            if (rejection.errors[0]?.code === 'file-too-large') {
                setError(`File is too large. Maximum size is ${maxSize / (1024 * 1024)}MB`);
            } else if (rejection.errors[0]?.code === 'file-invalid-type') {
                setError('Invalid file type. Please upload a JPEG, PNG, or WebP image.');
            } else {
                setError('Failed to upload file. Please try again.');
            }
            return;
        }

        if (acceptedFiles.length > 0) {
            const file = acceptedFiles[0];

            // Create preview
            const reader = new FileReader();
            reader.onload = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);

            // Call upload handler
            onUpload(file);
        }
    }, [onUpload, maxSize]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: accept.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
        maxSize,
        multiple: false,
    });

    const handleRemove = () => {
        setPreview(null);
        setError(null);
    };

    return (
        <div className="space-y-4">
            {!preview ? (
                <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${isDragActive
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
                        }`}
                >
                    <input {...getInputProps()} />

                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>

                        <div>
                            <p className="text-lg font-semibold text-slate-700">
                                {isDragActive ? 'Drop image here' : 'Drag & drop an image'}
                            </p>
                            <p className="text-sm text-slate-500 mt-1">
                                or click to browse
                            </p>
                        </div>

                        <p className="text-xs text-slate-400">
                            Supported: JPEG, PNG, WebP (max {maxSize / (1024 * 1024)}MB)
                        </p>
                    </div>
                </div>
            ) : (
                <div className="relative rounded-xl overflow-hidden border-2 border-slate-200">
                    <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-64 object-cover"
                    />
                    <button
                        onClick={handleRemove}
                        className="absolute top-3 right-3 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 shadow-lg transition-all"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            )}

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}
        </div>
    );
}
