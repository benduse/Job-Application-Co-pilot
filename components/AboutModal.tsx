import React, { useEffect, useRef } from "react";

const AboutModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
	const modalRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				onClose();
			}
		};

		const handleClickOutside = (event: MouseEvent) => {
			if (
				modalRef.current &&
				!modalRef.current.contains(event.target as Node)
			) {
				onClose();
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		document.addEventListener("mousedown", handleClickOutside);

		modalRef.current?.focus();

		return () => {
			document.removeEventListener("keydown", handleKeyDown);
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [onClose]);

	return (
		<div
			className='fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4'
			role='dialog'
			aria-modal='true'
			aria-labelledby='about-modal-title'
		>
			<div
				ref={modalRef}
				className='bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full border border-slate-700 transform transition-all'
				tabIndex={-1}
			>
				<div className='p-6 border-b border-slate-700 flex justify-between items-center'>
					<h2 id='about-modal-title' className='text-xl font-bold text-white'>
						About Job Application Co-Pilot
					</h2>
					<button
						onClick={onClose}
						className='text-slate-400 hover:text-white transition-colors'
						aria-label='Close'
					>
						<svg
							className='h-6 w-6'
							fill='none'
							viewBox='0 0 24 24'
							stroke='currentColor'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={2}
								d='M6 18L18 6M6 6l12 12'
							/>
						</svg>
					</button>
				</div>
				<div className='p-6 text-slate-300 space-y-4'>
					<p>
						Apply for your next job with confidence. This app helps you compare
						keywords from the job posting to your resume, tailor your
						application, and get a fine-tuned cover letter.
					</p>
					<p>
						Let our AI co-pilot give you the insights to stand out and get hired
						faster.
					</p>
				</div>
				<div className='px-6 py-4 bg-slate-900/50 rounded-b-lg text-right'>
					<button
						onClick={onClose}
						className='px-5 py-2 text-sm font-bold text-white bg-cyan-600 rounded-md hover:bg-cyan-500 transition-colors duration-150'
					>
						Got it!
					</button>
				</div>
			</div>
		</div>
	);
};

export default AboutModal;
