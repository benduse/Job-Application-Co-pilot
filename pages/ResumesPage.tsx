import React, { useState, useEffect } from 'react';
import { SavedResume } from '../types';
import { getResumes, deleteResume } from '../services/apiService';
import Loader from '../components/Loader';

interface ResumesPageProps {
    onNavigateHome: () => void;
    onLoadResume: (content: string) => void;
}

const ResumesPage: React.FC<ResumesPageProps> = ({ onNavigateHome, onLoadResume }) => {
    const [resumes, setResumes] = useState<SavedResume[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchResumes = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const resumesFromDb = await getResumes();
            setResumes(resumesFromDb);
        } catch (err: any) {
            setError(err.message || "Failed to load resumes.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchResumes();
    }, []);

    const handleDelete = async (id: string) => {
        // Optimistic UI update
        const originalResumes = [...resumes];
        setResumes(resumes.filter(r => r._id !== id));
        try {
            await deleteResume(id);
        } catch (err: any) {
            // Revert on error
            setError(err.message || "Failed to delete resume. Please try again.");
            setResumes(originalResumes);
        }
    };
    
    const handleDownload = (resume: SavedResume) => {
        const blob = new Blob([resume.content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const safeName = resume.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        a.download = `resume_${safeName}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex flex-col items-center justify-center py-16">
                    <Loader />
                    <p className="mt-4 text-slate-400">Loading saved resumes...</p>
                </div>
            );
        }
        if (resumes.length > 0) {
            return resumes.map(resume => (
                <div key={resume._id} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                        <p className="font-semibold text-white">{resume.name}</p>
                        <p className="text-sm text-slate-400">Saved: {new Date(resume.savedAt).toLocaleString()}</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                        <button onClick={() => onLoadResume(resume.content)} className="px-3 py-1 text-xs font-bold text-white bg-cyan-600 rounded-md hover:bg-cyan-500">Load</button>
                        <button onClick={() => handleDownload(resume)} className="px-3 py-1 text-xs font-bold text-white bg-indigo-600 rounded-md hover:bg-indigo-500">Download</button>
                        <button onClick={() => handleDelete(resume._id)} className="px-3 py-1 text-xs font-bold text-slate-300 bg-slate-700 hover:bg-red-800/50">Delete</button>
                    </div>
                </div>
            ));
        }
        return <p className="text-center text-slate-400 py-8">You have no saved resumes. Save a version from the results page after an analysis.</p>;
    };

    return (
        <div className="animate-fade-in w-full max-w-4xl mx-auto">
             <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">Saved Resumes</h1>
                <button
                    onClick={onNavigateHome}
                    className="px-5 py-2 text-sm font-bold text-white bg-indigo-600 rounded-md hover:bg-indigo-500 transition-colors duration-150"
                >
                    &larr; Back to App
                </button>
            </div>
            {error && (
                <div className="mb-4 bg-red-900/50 text-red-300 p-3 rounded-md text-sm">
                    <strong>Error:</strong> {error}
                </div>
            )}
            <div className="space-y-4">
                {renderContent()}
            </div>
        </div>
    );
};

export default ResumesPage;