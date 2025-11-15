import React, { useState } from 'react';
import { JobListing } from '../types';
import { searchForJobs } from '../services/geminiService';
import Loader from '../components/Loader';

interface JobSearchPageProps {
    onNavigateHome: () => void;
    onLoadJob: (jobData: JobListing) => void;
}

type JobSite = 'linkedin.com/jobs' | 'indeed.com' | 'myworkdayjobs.com';

const JobSearchPage: React.FC<JobSearchPageProps> = ({ onNavigateHome, onLoadJob }) => {
    const [query, setQuery] = useState('');
    const [site, setSite] = useState<JobSite>('linkedin.com/jobs');
    const [results, setResults] = useState<JobListing[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;
        setIsLoading(true);
        setError(null);
        setResults([]);
        try {
            const jobListings = await searchForJobs(query, site);
            setResults(jobListings);
             if (jobListings.length === 0) {
                setError("No job listings found for your search criteria. Try different keywords.");
            }
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred during the search.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleFetchAndLoad = (job: JobListing) => {
        onLoadJob(job);
    };

    const siteOptions: { name: string, value: JobSite }[] = [
        { name: 'LinkedIn', value: 'linkedin.com/jobs' },
        { name: 'Indeed', value: 'indeed.com' },
        { name: 'Workday', value: 'myworkdayjobs.com' },
    ];

    return (
        <div className="animate-fade-in w-full max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">Find Job Listings</h1>
                <button
                    onClick={onNavigateHome}
                    className="px-5 py-2 text-sm font-bold text-white bg-indigo-600 rounded-md hover:bg-indigo-500 transition-colors duration-150"
                >
                    &larr; Back to Dashboard
                </button>
            </div>

            <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
                <form onSubmit={handleSearch}>
                    <label htmlFor="job-search-query" className="block text-sm font-medium text-slate-300 mb-2">Job Title or Keywords</label>
                    <div className="flex gap-2 mb-4">
                        <input
                            id="job-search-query"
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="e.g., Senior Frontend Engineer"
                            className="flex-grow bg-slate-800 border border-slate-600 rounded-md shadow-sm p-3 text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition duration-150 ease-in-out"
                        />
                         <button type="submit" disabled={isLoading || !query.trim()} className="flex items-center justify-center px-6 py-2 text-sm font-bold text-white bg-cyan-600 rounded-md hover:bg-cyan-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors duration-150">
                            {isLoading ? <Loader /> : 'Search'}
                         </button>
                    </div>
                    <div className="flex items-center gap-4">
                         <span className="text-sm font-medium text-slate-300">Search on:</span>
                        <div className="flex gap-2">
                            {siteOptions.map(option => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => setSite(option.value)}
                                    className={`px-4 py-1.5 text-xs font-bold rounded-full transition-colors ${site === option.value ? 'bg-cyan-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                                >
                                    {option.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </form>
            </div>

             {error && (
                <div className="mt-4 bg-red-900/50 text-red-300 p-3 rounded-md text-sm">
                    <strong>Error:</strong> {error}
                </div>
            )}

            <div className="mt-6 space-y-4">
                {isLoading && !results.length && (
                    <div className="text-center py-8">
                        <Loader />
                        <p className="mt-4 text-slate-400">Searching for jobs...</p>
                    </div>
                )}
                {results.map((job) => (
                    <div key={job.url} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-3">
                            <div className="flex-1">
                                <a href={job.url} target="_blank" rel="noopener noreferrer" className="text-lg font-semibold text-cyan-400 hover:underline">{job.title}</a>
                                <p className="text-md text-slate-300">{job.company}</p>
                                <p className="text-sm text-slate-400 mt-2 italic">"{job.snippet}"</p>
                            </div>
                            <button
                                onClick={() => handleFetchAndLoad(job)}
                                className="flex-shrink-0 flex items-center justify-center w-full sm:w-36 px-4 py-2 text-sm font-bold text-white bg-indigo-600 rounded-md hover:bg-indigo-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors duration-150"
                            >
                                Add to Dashboard
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default JobSearchPage;