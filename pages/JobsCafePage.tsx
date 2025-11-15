import React, { useState, useEffect, useCallback } from 'react';
import { HiringCafeJob } from '../types';
import { fetchHiringCafeJobs } from '../services/hiringCafeService';
import Loader from '../components/Loader';

interface JobsCafePageProps {
    onNavigateHome: () => void;
    onLoadJob: (jobData: HiringCafeJob) => void;
}

const JobsCafePage: React.FC<JobsCafePageProps> = ({ onNavigateHome, onLoadJob }) => {
    const [jobs, setJobs] = useState<HiringCafeJob[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadJobs = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const jobListings = await fetchHiringCafeJobs();
            setJobs(jobListings);
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadJobs();
    }, [loadJobs]);

    const renderContent = () => {
        if (isLoading && jobs.length === 0) {
            return (
                <div className="text-center py-16">
                    <div className="flex justify-center"><Loader /></div>
                    <p className="mt-4 text-slate-400">Fetching latest jobs from hiring.cafe...</p>
                </div>
            );
        }

        if (jobs.length === 0 && !error) {
            return <p className="text-center text-slate-400 py-16">No job listings found at the moment.</p>;
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobs.map(job => (
                    <div key={job.id} className="bg-slate-800/50 border border-slate-700 rounded-lg shadow-lg flex flex-col p-5 transition-transform duration-300 hover:scale-105 hover:border-cyan-500/50">
                        <div className="flex items-center mb-4">
                            <img src={job.company_logo_url} alt={`${job.company_name} logo`} className="w-12 h-12 rounded-md mr-4 bg-white p-1" />
                            <div>
                                <h3 className="font-bold text-white leading-tight">{job.title}</h3>
                                <p className="text-sm text-slate-400">{job.company_name}</p>
                            </div>
                        </div>
                        <div className="flex-grow space-y-3">
                             <p className="text-xs text-slate-400 flex items-center gap-1.5"><LocationIcon /> {job.location}</p>
                            <div className="flex flex-wrap gap-1.5">
                                {job.tags.slice(0, 4).map(tag => (
                                    <span key={tag} className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">{tag}</span>
                                ))}
                            </div>
                        </div>
                        <div className="mt-5 flex justify-between items-center pt-4 border-t border-slate-700/50">
                             <a href={job.url} target="_blank" rel="noopener noreferrer" className="text-xs text-cyan-400 hover:underline">View Posting</a>
                             <button
                                onClick={() => onLoadJob(job)}
                                className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 rounded-md hover:bg-indigo-500 transition-colors"
                            >
                                Add to Dashboard
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="animate-fade-in w-full max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Browse Jobs on Hiring.cafe</h1>
                    <p className="text-slate-400 mt-1">Find your next role. Add any listing to your dashboard for analysis.</p>
                </div>
                 <div className="flex items-center gap-2 self-start sm:self-center">
                    <button
                        onClick={loadJobs}
                        disabled={isLoading}
                        className="flex items-center justify-center flex-shrink-0 px-4 py-2 text-sm font-bold text-white bg-cyan-600 rounded-md hover:bg-cyan-500 transition-colors duration-150 disabled:bg-slate-600 disabled:cursor-not-allowed w-24"
                        aria-label="Refresh job listings"
                    >
                        {isLoading ? <Loader /> : 'Refresh'}
                    </button>
                    <button
                        onClick={onNavigateHome}
                        className="flex-shrink-0 px-5 py-2 text-sm font-bold text-white bg-slate-600 rounded-md hover:bg-slate-500 transition-colors duration-150"
                    >
                        &larr; Back to Dashboard
                    </button>
                </div>
            </div>

            {error && (
                <div className="my-4 bg-red-900/50 text-red-300 p-4 rounded-md text-sm text-center">
                    <strong>Error:</strong> {error}
                </div>
            )}

            {renderContent()}
        </div>
    );
};


const LocationIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);


export default JobsCafePage;