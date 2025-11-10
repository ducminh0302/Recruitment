import React, { useState } from 'react';
import { useRecruitmentContext } from '../../context/RecruitmentContext';
import { parseCv } from '../../services/geminiService';
import { AppPhase, Candidate } from '../../types';
import Loader from '../Loader';
import { UploadCloudIcon, XMarkIcon } from '../icons';

const fileToBase64 = (file: File): Promise<{ data: string, mimeType: string }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            // result is in format "data:application/pdf;base64,ASDF..."
            const data = result.split(',')[1];
            resolve({ data, mimeType: file.type });
        };
        reader.onerror = error => reject(error);
    });
};

const Phase1_CVScanner: React.FC = () => {
    const { dispatch } = useRecruitmentContext();
    const [files, setFiles] = useState<File[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [parsedCandidates, setParsedCandidates] = useState<Candidate[]>([]);

    const handleFiles = (newFiles: FileList | null) => {
        if (newFiles) {
            const allowedTypes = ['application/pdf'];
            const addedFiles = Array.from(newFiles).filter(file =>
                allowedTypes.includes(file.type)
            );
            // Prevent duplicate files
            setFiles(prev => {
                const existingNames = new Set(prev.map(f => f.name));
                const uniqueNewFiles = addedFiles.filter(f => !existingNames.has(f.name));
                return [...prev, ...uniqueNewFiles];
            });
        }
    };
    
    const removeFile = (fileName: string) => {
        setFiles(prev => prev.filter(f => f.name !== fileName));
    };

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); };
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files);
            e.dataTransfer.clearData();
        }
    };

    const handleParse = async () => {
        if (files.length === 0) {
            setError('Please upload at least one CV file.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setParsedCandidates([]);

        try {
            const results = await Promise.all(
                files.map(async (file, index) => {
                    try {
                        const fileData = await fileToBase64(file);
                        const profile = await parseCv(fileData);
                        if (profile) {
                            return { id: `candidate-${Date.now()}-${index}`, profile };
                        }
                    } catch (err) {
                        console.error(`Failed to process file ${file.name}:`, err);
                    }
                    return null;
                })
            );
            const successfulCandidates = results.filter(c => c !== null) as Candidate[];
            setParsedCandidates(successfulCandidates);
            if (successfulCandidates.length === 0) {
                 setError('Could not parse any CVs. Please check the file formats and content, then try again.');
            }
        } catch (e) {
            if (e instanceof Error) {
                setError(e.message);
            } else {
                setError('An unexpected error occurred. Please try again.');
            }
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirm = () => {
        if (parsedCandidates.length > 0) {
            dispatch({ type: 'SET_CANDIDATES', payload: parsedCandidates });
            dispatch({ type: 'SET_PHASE', payload: AppPhase.SCREENING });
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg border border-gray-200">
            <h2 className="text-2xl font-bold text-blue-600 mb-4">CV Scanning & Extraction</h2>
            <p className="text-gray-600 mb-6">
                Upload candidate CVs in PDF format. The AI will extract key information to create a structured profile for each candidate.
            </p>

            <div
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'}`}
            >
                <input
                    type="file"
                    id="file-upload"
                    multiple
                    accept=".pdf,application/pdf"
                    onChange={(e) => handleFiles(e.target.files)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={isLoading}
                />
                <label htmlFor="file-upload" className="flex flex-col items-center justify-center cursor-pointer">
                    <UploadCloudIcon className="w-12 h-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">
                        <span className="font-semibold text-blue-600">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PDF files only</p>
                    <p className="text-xs text-gray-500 mt-1">Please convert DOCX files to PDF before uploading.</p>
                </label>
            </div>

            {files.length > 0 && (
                <div className="mt-6">
                    <h3 className="text-lg font-medium text-gray-800">Selected Files:</h3>
                    <ul className="mt-2 border border-gray-200 rounded-md divide-y divide-gray-200">
                        {files.map(file => (
                            <li key={file.name} className="px-4 py-3 flex items-center justify-between text-sm hover:bg-gray-50">
                                <span className="text-gray-700 font-medium truncate pr-4">{file.name}</span>
                                <button
                                    onClick={() => removeFile(file.name)}
                                    className="p-1 rounded-full text-gray-500 hover:bg-red-100 hover:text-red-600 transition-colors"
                                    aria-label={`Remove ${file.name}`}
                                    disabled={isLoading}
                                >
                                    <XMarkIcon className="w-4 h-4" />
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {error && <p className="text-red-600 mt-4">{error}</p>}

            <div className="mt-6 flex justify-end">
                <button
                    onClick={handleParse}
                    disabled={isLoading || parsedCandidates.length > 0 || files.length === 0}
                    className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                    Scan & Parse CVs
                </button>
            </div>
            
            {isLoading && <div className="mt-6"><Loader text={`Parsing ${files.length} CV(s)...`} /></div>}

            {parsedCandidates.length > 0 && (
                <div className="mt-8 p-4 bg-gray-50/70 border border-gray-200 rounded-lg">
                    <h3 className="text-xl font-semibold text-blue-500 mb-4">Parsed Candidates ({parsedCandidates.length})</h3>
                    <ul className="space-y-4">
                        {parsedCandidates.map(candidate => (
                            <li key={candidate.id} className="p-4 bg-white border border-gray-200 rounded-md">
                                <p className="font-bold text-gray-900">{candidate.profile.name}</p>
                                <p className="text-sm text-gray-600">{candidate.profile.email}</p>
                            </li>
                        ))}
                    </ul>
                     <div className="mt-6 flex justify-end">
                         <button
                            onClick={handleConfirm}
                            className="px-6 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition-colors"
                        >
                            Confirm & Proceed to AI Screening
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Phase1_CVScanner;