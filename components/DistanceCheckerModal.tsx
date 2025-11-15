import React, { useState, useEffect, useRef } from 'react';
import { DistanceResult } from '../types';
import { calculateDistance, getAddressFromCoordinates } from '../services/geminiService';
import Loader from './Loader';

interface DistanceCheckerModalProps {
    onClose: () => void;
}

const DistanceCheckerModal: React.FC<DistanceCheckerModalProps> = ({ onClose }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isGettingLocation, setIsGettingLocation] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<DistanceResult | null>(null);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) onClose();
        };
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    const handleCalculate = async () => {
        if (!origin.trim() || !destination.trim()) return;
        setIsLoading(true);
        setError(null);
        setResult(null);
        try {
            const distanceResult = await calculateDistance(origin, destination);
            setResult(distanceResult);
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUseCurrentLocation = () => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser.');
            return;
        }
        setIsGettingLocation(true);
        setError(null);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;
                    const address = await getAddressFromCoordinates(latitude, longitude);
                    setOrigin(address);
                } catch (err: any) {
                    setError(err.message);
                } finally {
                    setIsGettingLocation(false);
                }
            },
            (err) => {
                setError(`Failed to get location: ${err.message}`);
                setIsGettingLocation(false);
            }
        );
    };

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="distance-modal-title"
        >
            <div 
                ref={modalRef}
                className="bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full border border-slate-700 transform transition-all"
            >
                <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                    <h2 id="distance-modal-title" className="text-xl font-bold text-white">
                        Commute Distance Calculator
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors" aria-label="Close">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <div className="p-6 text-slate-300 space-y-4">
                    <div>
                        <label htmlFor="origin-address" className="block text-sm font-medium text-slate-300 mb-2">Your Home Address</label>
                        <div className="flex gap-2">
                             <input
                                id="origin-address"
                                type="text"
                                value={origin}
                                onChange={(e) => setOrigin(e.target.value)}
                                placeholder="e.g., 1600 Amphitheatre Parkway, Mountain View, CA"
                                className="flex-grow bg-slate-900 border border-slate-600 rounded-md shadow-sm p-3 text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                            />
                            <button onClick={handleUseCurrentLocation} disabled={isGettingLocation} className="flex-shrink-0 flex items-center justify-center px-3 py-2 text-xs font-bold text-white bg-slate-600 rounded-md hover:bg-slate-500 disabled:bg-slate-700 disabled:cursor-not-allowed transition-colors">
                                {isGettingLocation ? <Loader /> : <LocationMarkerIcon />}
                            </button>
                        </div>
                    </div>
                     <div>
                        <label htmlFor="destination-address" className="block text-sm font-medium text-slate-300 mb-2">Work Address</label>
                        <input
                            id="destination-address"
                            type="text"
                            value={destination}
                            onChange={(e) => setDestination(e.target.value)}
                            placeholder="e.g., 1 Infinite Loop, Cupertino, CA"
                            className="w-full bg-slate-900 border border-slate-600 rounded-md shadow-sm p-3 text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                        />
                    </div>
                    {error && <div className="bg-red-900/50 text-red-300 p-3 rounded-md text-sm"><strong>Error:</strong> {error}</div>}
                    {result && (
                        <div className="bg-slate-900/50 text-green-300 p-4 rounded-md text-center border border-slate-700">
                            <p className="text-sm text-slate-400">The driving distance between <br/><span className="font-semibold text-slate-300">{result.originAddress}</span> <br/>and <br/><span className="font-semibold text-slate-300">{result.destinationAddress}</span> is:</p>
                            <p className="text-3xl font-bold text-green-400 mt-2">{result.distance.toFixed(1)} {result.unit}</p>
                        </div>
                    )}
                </div>
                <div className="px-6 py-4 bg-slate-900/50 rounded-b-lg flex justify-end items-center gap-4">
                     <button onClick={onClose} className="px-5 py-2 text-sm font-bold text-slate-300 bg-slate-600 rounded-md hover:bg-slate-500 transition-colors">Close</button>
                     <button onClick={handleCalculate} disabled={isLoading || !origin.trim() || !destination.trim()} className="flex items-center justify-center w-40 px-5 py-2 text-sm font-bold text-white bg-cyan-600 rounded-md hover:bg-cyan-500 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed">
                        {isLoading ? <Loader /> : 'Calculate Distance'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const LocationMarkerIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
    </svg>
);


export default DistanceCheckerModal;