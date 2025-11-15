import React, { useEffect, useRef } from 'react';
import { ImprovementSuggestion } from '../types';

interface SuggestionModalProps {
    suggestion: ImprovementSuggestion;
    onClose: () => void;
    onAccept: (suggestion: ImprovementSuggestion) => void;
}

const SuggestionModal: React.FC<SuggestionModalProps> = ({ suggestion, onClose, onAccept }) => {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose();
            }
        }
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="suggestion-modal-title"
        >
            <div 
                ref={modalRef}
                className="bg-slate-800 rounded-lg shadow-xl max-w-4xl w-full border border-slate-700 transform transition-all flex flex-col max-h-[90vh]"
            >
                <div className="p-5 border-b border-slate-700 flex justify-between items-center flex-shrink-0">
                    <h2 id="suggestion-modal-title" className="text-xl font-bold text-white flex items-center gap-2">
                        <MagicWandIcon />
                        Review Suggestion
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors" aria-label="Close">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="p-6 text-slate-300 space-y-4 overflow-y-auto">
                    <p className="text-sm text-slate-400">The AI suggests the following improvement for <span className="font-semibold text-indigo-400">{suggestion.suggestionType}</span>:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h3 className="font-semibold text-red-400 mb-2">Before</h3>
                            <p className="text-sm bg-slate-900/50 p-4 rounded-md border border-slate-700 h-full">{suggestion.originalText}</p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-green-400 mb-2">After</h3>
                            <p className="text-sm bg-slate-900/50 p-4 rounded-md border border-slate-700 h-full">{suggestion.suggestedRewrite}</p>
                        </div>
                    </div>
                </div>
                <div className="px-6 py-4 bg-slate-900/50 rounded-b-lg flex justify-end items-center gap-3 flex-shrink-0">
                     <button
                        onClick={onClose}
                        className="px-5 py-2 text-sm font-bold text-slate-300 bg-slate-600 rounded-md hover:bg-slate-500 transition-colors duration-150"
                    >
                        Reject
                    </button>
                    <button
                        onClick={() => onAccept(suggestion)}
                        className="px-5 py-2 text-sm font-bold text-white bg-cyan-600 rounded-md hover:bg-cyan-500 transition-colors duration-150"
                    >
                        Accept Change
                    </button>
                </div>
            </div>
        </div>
    );
};

const MagicWandIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.25278C12 6.25278 15.6364 2.61636 20 7.00001C24.3636 11.3836 20.7273 15.0199 20.7273 15.0199M12 6.25278C12 6.25278 8.36364 2.61636 4 7.00001C-0.363636 11.3836 3.27273 15.0199 3.27273 15.0199M12 6.25278L12 21.25" /></svg>;


export default SuggestionModal;