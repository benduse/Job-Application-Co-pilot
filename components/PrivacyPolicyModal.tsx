
import React, { useEffect, useRef } from 'react';

const PrivacyPolicyModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
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

        modalRef.current?.focus();

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
            aria-labelledby="privacy-modal-title"
        >
            <div 
                ref={modalRef}
                className="bg-slate-800 rounded-lg shadow-xl max-w-3xl w-full border border-slate-700 transform transition-all flex flex-col max-h-[90vh]"
                tabIndex={-1}
            >
                <div className="p-6 border-b border-slate-700 flex justify-between items-center flex-shrink-0">
                    <h2 id="privacy-modal-title" className="text-xl font-bold text-white">
                        Privacy Policy
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors" aria-label="Close">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="p-6 text-slate-300 space-y-4 overflow-y-auto">
                    <p className="text-sm text-slate-400">Last Updated: {new Date().toLocaleDateString()}</p>
                    
                    <p>This Privacy Policy explains how Job Application Co-Pilot ("we," "us," or "our") collects, uses, and discloses information about you when you use our service. We are committed to protecting your privacy and handling your data in an open and transparent manner.</p>
                    
                    <h3 className="text-lg font-semibold text-cyan-400 pt-2">1. Information We Collect</h3>
                    <p>We collect information you provide directly to us. This includes:</p>
                    <ul className="list-disc list-inside space-y-1 pl-4 text-slate-400">
                        <li><strong>Resume and Job Description Data:</strong> The content of your resume and the job descriptions you provide for analysis. This may include personal information such as your name, contact details, employment history, and skills.</li>
                        <li><strong>Customer Proprietary Network Information (CPNI):</strong> While our primary function does not involve telecommunications services, any data that could be considered CPNI under applicable laws (e.g., information related to your use of our services) is treated with the highest level of confidentiality and in accordance with legal requirements.</li>
                    </ul>

                    <h3 className="text-lg font-semibold text-cyan-400 pt-2">2. How We Use Information</h3>
                    <p>We use the information we collect to:</p>
                     <ul className="list-disc list-inside space-y-1 pl-4 text-slate-400">
                        <li>Provide, maintain, and improve our services, including analyzing your resume against job descriptions.</li>
                        <li>Generate tailored cover letters and improvement suggestions.</li>
                        <li>Communicate with you about the service.</li>
                        <li>Comply with legal obligations and protect the security of our service.</li>
                    </ul>
                    <p>Your data is processed by the Google Gemini API solely for the purpose of providing the analysis you request. We do not use your personal data to train the model.</p>

                    <h3 className="text-lg font-semibold text-cyan-400 pt-2">3. Information Sharing</h3>
                    <p>We do not sell, rent, or share your personal information with third parties for their marketing purposes. We may share information as follows:</p>
                     <ul className="list-disc list-inside space-y-1 pl-4 text-slate-400">
                        <li>With our third-party service providers (like Google for the Gemini API) who need access to such information to carry out work on our behalf.</li>
                        <li>In response to a request for information if we believe disclosure is in accordance with, or required by, any applicable law or legal process.</li>
                        <li>If we believe your actions are inconsistent with our user agreements or policies, or to protect the rights, property, and safety of us or others.</li>
                    </ul>

                    <h3 className="text-lg font-semibold text-cyan-400 pt-2">4. Data Security</h3>
                    <p>We implement reasonable security measures designed to protect the security of any personal information we process. However, please also remember that we cannot guarantee that the internet itself is 100% secure. Although we will do our best to protect your personal information, transmission of personal information to and from our service is at your own risk.</p>

                     <h3 className="text-lg font-semibold text-cyan-400 pt-2">5. Your Rights Regarding CPNI</h3>
                    <p>To the extent we handle any information classified as CPNI, you have the right to restrict our use of your CPNI for marketing purposes. You may deny or withdraw our right to use your CPNI at any time. A denial or withdrawal of consent will not affect the provision of the services to you.</p>

                    <h3 className="text-lg font-semibold text-cyan-400 pt-2">6. Changes to this Policy</h3>
                    <p>We may change this Privacy Policy from time to time. If we make changes, we will notify you by revising the "Last Updated" date at the top of the policy and, in some cases, we may provide you with additional notice. We encourage you to review the Privacy Policy whenever you access the service to stay informed about our information practices.</p>

                </div>
                <div className="px-6 py-4 bg-slate-900/50 rounded-b-lg text-right flex-shrink-0">
                     <button
                        onClick={onClose}
                        className="px-5 py-2 text-sm font-bold text-white bg-cyan-600 rounded-md hover:bg-cyan-500 transition-colors duration-150"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicyModal;
