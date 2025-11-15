import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Header from './components/Header';
import Footer from './components/Footer';
import AboutModal from './components/AboutModal';
import PrivacyPolicyModal from './components/PrivacyPolicyModal';
import JobListingsPage from './pages/JobListingsPage';
import ResumesPage from './pages/ResumesPage';
import JobSearchPage from './pages/JobSearchPage';
import JobsCafePage from './pages/JobsCafePage';
import AgenciesPage from './pages/AgenciesPage';
import SuggestionModal from './components/SuggestionModal';
import DistanceCheckerModal from './components/DistanceCheckerModal';
import { JobAnalysis, Job, ImprovementSuggestion, JobListing, HiringCafeJob } from './types';
import { analyzeJobFit, fetchJobDescriptionFromUrl } from './services/geminiService';
import { templateResumeContent } from './data/defaultData';


const App: React.FC = () => {
    const [view, setView] = useState<'listings' | 'search' | 'resumes' | 'agencies' | 'hiringCafe'>('listings');
    const [resume, setResume] = useState<string>(templateResumeContent);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
    const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
    const [isDistanceModalOpen, setIsDistanceModalOpen] = useState(false);
    const [activeSuggestion, setActiveSuggestion] = useState<ImprovementSuggestion | null>(null);

    const handleAddJob = () => {
        const newJob: Job = {
            id: uuidv4(),
            url: '',
            title: 'New Job Listing',
            company: 'Company Name',
            description: '',
            isFetching: false,
            isLoading: false,
            error: null,
            analysis: null,
        };
        setJobs(prev => [newJob, ...prev]);
    };

    const handleUpdateJob = (id: string, updates: Partial<Job>) => {
        setJobs(jobs => jobs.map(j => (j.id === id ? { ...j, ...updates } : j)));
    };

    const handleAddJobFromSearch = (listing: JobListing) => {
        setView('listings');
        const newJob: Job = {
            id: uuidv4(),
            url: listing.url,
            title: listing.title,
            company: listing.company,
            description: 'Fetching description...',
            isFetching: true,
            isLoading: false,
            error: null,
            analysis: null,
        };
        setJobs(prev => [newJob, ...prev]);

        (async () => {
            try {
                const description = await fetchJobDescriptionFromUrl(listing.url);
                handleUpdateJob(newJob.id, { description, isFetching: false });
            } catch (err: any) {
                handleUpdateJob(newJob.id, { 
                    error: err.message, 
                    isFetching: false, 
                    description: 'Failed to fetch job description. Please paste it manually.' 
                });
            }
        })();
    };

    const handleAddJobFromCafe = (listing: HiringCafeJob) => {
        setView('listings');
        const newJob: Job = {
            id: uuidv4(),
            url: listing.url,
            title: listing.title,
            company: listing.company_name,
            description: listing.description, // Description is included in the API response
            isFetching: false,
            isLoading: false,
            error: null,
            analysis: null,
        };
        setJobs(prev => [newJob, ...prev]);
    };


    const handleRemoveJob = (id: string) => {
        setJobs(jobs => jobs.filter(j => j.id !== id));
    };

    const handleFetchDescription = async (id: string) => {
        const job = jobs.find(j => j.id === id);
        if (!job || !job.url) return;
        
        handleUpdateJob(id, { isFetching: true, error: null });
        try {
            const description = await fetchJobDescriptionFromUrl(job.url);
            handleUpdateJob(id, { description, isFetching: false });
        } catch (err: any) {
            handleUpdateJob(id, { error: err.message, isFetching: false });
        }
    };
    
    const handleAnalyzeJob = async (id: string) => {
        const job = jobs.find(j => j.id === id);
        if (!job || !resume.trim() || !job.description.trim()) return;
        
        handleUpdateJob(id, { isLoading: true, error: null });
        try {
            const result = await analyzeJobFit(resume, job.description);
            handleUpdateJob(id, { 
                analysis: result, 
                isLoading: false, 
                analyzedAt: new Date().toISOString() 
            });
        } catch (err: any) {
            handleUpdateJob(id, { error: err.message, isLoading: false });
        }
    };

    const handleLoadResume = (content: string) => {
        setResume(content);
        setView('listings');
    };

    const handleApplySuggestion = (suggestion: ImprovementSuggestion) => {
        setResume(current => current.replace(suggestion.originalText, suggestion.suggestedRewrite));
        setActiveSuggestion(null);
    };



    const renderContent = () => {
        switch (view) {
            case 'resumes':
                return <ResumesPage onNavigateHome={() => setView('listings')} onLoadResume={handleLoadResume} />;
            case 'search':
                return <JobSearchPage onNavigateHome={() => setView('listings')} onLoadJob={handleAddJobFromSearch} />;
            case 'hiringCafe':
                return <JobsCafePage onNavigateHome={() => setView('listings')} onLoadJob={handleAddJobFromCafe} />;
             case 'agencies':
                return <AgenciesPage onNavigateHome={() => setView('listings')} />;
            case 'listings':
            default:
                return (
                    <JobListingsPage
                        resume={resume}
                        setResume={setResume}
                        jobs={jobs}
                        onAddJob={handleAddJob}
                        onRemoveJob={handleRemoveJob}
                        onUpdateJob={handleUpdateJob}
                        onFetchDescription={handleFetchDescription}
                        onAnalyzeJob={handleAnalyzeJob}
                        onSelectSuggestion={setActiveSuggestion}
                    />
                );
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-200 font-sans flex flex-col">
            <Header
                onAboutClick={() => setIsAboutModalOpen(true)}
                onNavigateToListings={() => setView('listings')}
                onNavigateToResumes={() => setView('resumes')}
                onNavigateToJobSearch={() => setView('search')}
                onNavigateToAgencies={() => setView('agencies')}
                onNavigateToHiringCafe={() => setView('hiringCafe')}
            />
            <main className="container mx-auto p-4 md:p-6 flex-grow flex flex-col">
                {renderContent()}
            </main>
            <Footer onPrivacyClick={() => setIsPrivacyModalOpen(true)} onAboutClick={() => setIsAboutModalOpen(true)} onDistanceClick={() => setIsDistanceModalOpen(true)} />
            {isAboutModalOpen && <AboutModal onClose={() => setIsAboutModalOpen(false)} />}
            {isPrivacyModalOpen && <PrivacyPolicyModal onClose={() => setIsPrivacyModalOpen(false)} />}
            {isDistanceModalOpen && <DistanceCheckerModal onClose={() => setIsDistanceModalOpen(false)} />}
            {activeSuggestion && (
                <SuggestionModal
                    suggestion={activeSuggestion}
                    onClose={() => setActiveSuggestion(null)}
                    onAccept={handleApplySuggestion}
                />
            )}
        </div>
    );
};

export default App;