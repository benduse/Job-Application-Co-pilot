import React from "react";
import { Job, ImprovementSuggestion } from "../types";
import Loader from "./Loader";
import MatchResult from "./MatchResult";
import TextAreaInput from "./TextAreaInput";

interface JobCardProps {
	job: Job;
	resume: string;
	onJobChange: (
		id: string,
		updates: Partial<Pick<Job, "url" | "description">>
	) => void;
	onFetch: (id: string) => void;
	onAnalyze: (id: string) => void;
	onRemove: (id: string) => void;
	isAnalyzeDisabled: boolean;
	onSelectSuggestion: (suggestion: ImprovementSuggestion) => void;
}

const JobCard: React.FC<JobCardProps> = ({
	job,
	resume,
	onJobChange,
	onFetch,
	onAnalyze,
	onRemove,
	isAnalyzeDisabled,
	onSelectSuggestion,
}) => {
	// A simple URL validation. It allows for URLs with or without a protocol.
	const isValidUrl = (url: string): boolean => {
		if (!url) return false;
		try {
			// Prepend 'https://' if protocol is missing, as the URL constructor requires it.
			const urlWithProtocol = /^(https?:\/\/)/i.test(url)
				? url
				: `https://${url}`;
			new URL(urlWithProtocol);
			return true;
		} catch (e) {
			return false;
		}
	};

	const isUrlValid = isValidUrl(job.url);
	const showUrlError = job.url.length > 0 && !isUrlValid;

	return (
		<div className='bg-slate-800/50 border border-slate-700 rounded-lg shadow-lg overflow-hidden transition-all duration-300'>
			<div className='p-4 space-y-4'>
				<div className='flex justify-between items-start'>
					<div className='flex-1 pr-4'>
						<h3 className='text-xl font-bold text-white'>
							{job.title || "New Job Listing"}
						</h3>
						<p className='text-sm text-slate-400'>
							{job.company || "Enter company name and job URL"}
						</p>
					</div>
					<button
						onClick={() => onRemove(job.id)}
						className='p-2 text-sm font-medium text-slate-400 bg-slate-800/50 rounded-full hover:bg-red-800/50 hover:text-red-300 transition-colors duration-150'
						aria-label='Remove Job'
					>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							className='h-5 w-5'
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
				<div>
					<label
						htmlFor={`job-url-${job.id}`}
						className='block text-sm font-medium text-slate-300 mb-2'
					>
						Job Posting URL
					</label>
					<div className='flex gap-2'>
						<input
							id={`job-url-${job.id}`}
							type='url'
							value={job.url}
							onChange={(e) => onJobChange(job.id, { url: e.target.value })}
							placeholder='https://example.com/job/posting'
							className={`flex-grow bg-slate-800 border rounded-md shadow-sm p-3 text-slate-200 placeholder-slate-500 focus:ring-2 transition duration-150 ease-in-out ${
								showUrlError
									? "border-red-500 focus:ring-red-500 focus:border-red-500"
									: "border-slate-600 focus:ring-cyan-500 focus:border-cyan-500"
							}`}
							aria-invalid={showUrlError}
							aria-describedby={
								showUrlError ? `job-url-error-${job.id}` : undefined
							}
						/>
						<button
							onClick={() => onFetch(job.id)}
							disabled={!job.url || !isUrlValid || job.isFetching}
							className='flex items-center justify-center px-4 py-2 text-sm font-bold text-white bg-indigo-600 rounded-md hover:bg-indigo-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors duration-150 w-24'
						>
							{job.isFetching ? <Loader /> : "Fetch"}
						</button>
					</div>
					{showUrlError && (
						<p
							id={`job-url-error-${job.id}`}
							className='mt-2 text-sm text-red-400'
						>
							Please enter a valid URL.
						</p>
					)}
				</div>

				<div className='relative flex items-center'>
					<div className='flex-grow border-t border-slate-700'></div>
					<span className='flex-shrink mx-4 text-slate-500 text-xs'>OR</span>
					<div className='flex-grow border-t border-slate-700'></div>
				</div>

				<TextAreaInput
					id={`job-desc-${job.id}`}
					label='Paste Job Description'
					value={job.description}
					onChange={(e) => onJobChange(job.id, { description: e.target.value })}
					placeholder='Paste the full job description here...'
					rows={8}
				/>
				<div className='pt-2 flex items-center justify-end'>
					<button
						onClick={() => onAnalyze(job.id)}
						disabled={isAnalyzeDisabled || job.isLoading}
						className='flex items-center justify-center px-6 py-2 text-sm font-bold text-white bg-cyan-600 rounded-md hover:bg-cyan-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors duration-150 w-40'
					>
						{job.isLoading ? <Loader /> : "Analyze Match"}
					</button>
				</div>
			</div>
			{job.error && (
				<div className='bg-red-900/50 text-red-300 p-4 text-sm border-t border-red-700'>
					<strong>Error:</strong> {job.error}
				</div>
			)}
			{job.analysis && (
				<div className='p-4 border-t border-slate-700'>
					<MatchResult
						analysis={job.analysis}
						resume={resume}
						onSelectSuggestion={onSelectSuggestion}
					/>
				</div>
			)}
		</div>
	);
};

export default JobCard;
