import React, { useState, useMemo } from 'react';
import { Job, ImprovementSuggestion } from '../types';
import ResumeInput from '../components/ResumeInput';
import JobCard from '../components/JobCard';

interface JobListingsPageProps {
    resume: string;
    setResume: (resume: string) => void;
    jobs: Job[];
    onAddJob: () => void;
    onRemoveJob: (id: string) => void;
    onUpdateJob: (id: string, updates: Partial<Pick<Job, 'url' | 'description'>>) => void;
    onFetchDescription: (id: string) => void;
    onAnalyzeJob: (id: string) => void;
    onSelectSuggestion: (suggestion: ImprovementSuggestion) => void;
}

type SortKey = 'title' | 'company' | 'analyzedAt';
type SortDirection = 'asc' | 'desc';

const JobListingsPage: React.FC<JobListingsPageProps> = ({
    resume, setResume, jobs, onAddJob, onRemoveJob, onUpdateJob, onFetchDescription, onAnalyzeJob, onSelectSuggestion
}) => {
    const [sortKey, setSortKey] = useState<SortKey>('analyzedAt');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

    const handleSort = (key: SortKey) => {
        if (key === sortKey) {
            setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortKey(key);
            // Default to descending for dates, ascending for text
            setSortDirection(key === 'analyzedAt' ? 'desc' : 'asc');
        }
    };

    const sortedJobs = useMemo(() => {
        const sortable = [...jobs];
        sortable.sort((a, b) => {
            let valA: string | number, valB: string | number;

            if (sortKey === 'analyzedAt') {
                // Unanalyzed jobs go to the bottom regardless of direction
                valA = a.analyzedAt ? new Date(a.analyzedAt).getTime() : 0;
                valB = b.analyzedAt ? new Date(b.analyzedAt).getTime() : 0;
            } else {
                valA = a[sortKey]?.toLowerCase() || '';
                valB = b[sortKey]?.toLowerCase() || '';
            }

            if (valA < valB) {
                return sortDirection === 'asc' ? -1 : 1;
            }
            if (valA > valB) {
                return sortDirection === 'asc' ? 1 : -1;
            }
            return 0;
        });
        return sortable;
    }, [jobs, sortKey, sortDirection]);

    const SortButton = ({ label, sortValue }: { label: string; sortValue: SortKey }) => {
        const isActive = sortKey === sortValue;
        return (
            <button
                onClick={() => handleSort(sortValue)}
                className={`px-3 py-1 text-xs font-bold rounded-full transition-colors ${isActive ? 'bg-cyan-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
            >
                {label}
                {isActive && (sortDirection === 'asc' ? ' ▲' : ' ▼')}
            </button>
        );
    };

    return (
        <div className="flex-grow flex flex-col animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-grow items-start">
                <aside className="lg:col-span-1 lg:sticky lg:top-20">
                    <ResumeInput resume={resume} setResume={setResume} />
                </aside>
                
                <main className="lg:col-span-2 space-y-6">
                    <div className="flex justify-between items-center">
                        <h1 className="text-3xl md:text-4xl font-bold text-white">Job Dashboard</h1>
                        <button 
                            onClick={onAddJob} 
                            className="px-4 py-2 text-sm font-bold text-white bg-cyan-600 rounded-md hover:bg-cyan-500 transition-colors duration-150 transform hover:scale-105"
                        >
                            + Add New Job
                        </button>
                    </div>

                    {jobs.length > 0 && (
                         <div className="flex items-center justify-end gap-2 text-sm p-2 bg-slate-800/30 rounded-md border border-slate-700/50">
                            <span className="text-slate-400 font-medium">Sort by:</span>
                            <SortButton label="Last Analyzed" sortValue="analyzedAt" />
                            <SortButton label="Title" sortValue="title" />
                            <SortButton label="Company" sortValue="company" />
                        </div>
                    )}

                    {jobs.length === 0 ? (
                        <div className="text-center py-16 bg-slate-800/30 rounded-lg border border-dashed border-slate-700">
                            <h2 className="text-xl font-semibold text-slate-300">Your dashboard is empty.</h2>
                            <p className="mt-2 text-slate-400">Click "Add New Job" to manually enter a job, or find one via "Job Listings" in the header.</p>
                        </div>
                    ) : (
                        sortedJobs.map(job => (
                            <JobCard
                                key={job.id}
                                job={job}
                                resume={resume}
                                onJobChange={onUpdateJob}
                                onFetch={onFetchDescription}
                                onAnalyze={onAnalyzeJob}
                                onRemove={onRemoveJob}
                                isAnalyzeDisabled={!resume.trim() || !job.description.trim()}
                                onSelectSuggestion={onSelectSuggestion}
                            />
                        ))
                    )}
                </main>
            </div>
        </div>
    );
};

export default JobListingsPage;