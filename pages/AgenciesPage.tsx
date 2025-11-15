import React from 'react';

interface AgenciesPageProps {
    onNavigateHome: () => void;
}

const AgenciesPage: React.FC<AgenciesPageProps> = ({ onNavigateHome }) => {
    return (
        <div className="animate-fade-in w-full max-w-4xl mx-auto text-center">
             <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">Recruiting Agencies</h1>
                <button
                    onClick={onNavigateHome}
                    className="px-5 py-2 text-sm font-bold text-white bg-indigo-600 rounded-md hover:bg-indigo-500 transition-colors duration-150"
                >
                    &larr; Back to App
                </button>
            </div>
            <div className="bg-slate-800/50 p-8 rounded-lg border border-slate-700 mt-6">
                <h2 className="text-2xl font-semibold text-cyan-400">Coming Soon!</h2>
                <p className="mt-4 text-slate-400">
                    This section will feature tools to help you find and track interactions with recruiting agencies. Check back for future updates.
                </p>
            </div>
        </div>
    );
};

export default AgenciesPage;
