import React, { useState, useMemo } from "react";
import { JobAnalysis, ImprovementSuggestion, Keyword } from "../types";

interface MatchResultProps {
	analysis: JobAnalysis;
	resume: string;
	onSelectSuggestion: (suggestion: ImprovementSuggestion) => void;
}

const AnalysisSection: React.FC<{
	title: string;
	children: React.ReactNode;
	icon: React.ReactNode;
	defaultOpen?: boolean;
}> = ({ title, children, icon, defaultOpen = false }) => {
	const [isOpen, setIsOpen] = useState(defaultOpen);
	return (
		<div className='bg-slate-800/50 rounded-lg border border-slate-700'>
			<button
				onClick={() => setIsOpen(!isOpen)}
				className='w-full p-4 flex justify-between items-center text-left'
			>
				<h3 className='text-lg font-semibold text-cyan-400 flex items-center'>
					{icon}
					<span className='ml-2'>{title}</span>
				</h3>
				<span
					className={`transform transition-transform duration-200 ${
						isOpen ? "rotate-180" : "rotate-0"
					}`}
				>
					<ChevronDownIcon />
				</span>
			</button>
			{isOpen && <div className='p-4 pt-0'>{children}</div>}
		</div>
	);
};

const KeywordCloud: React.FC<{
	keywords: Keyword[];
	color: "green" | "red";
}> = ({ keywords, color }) => {
	const colorClasses = {
		green: "bg-green-900/50 text-green-300",
		red: "bg-red-900/50 text-red-300",
	};
	return (
		<div className='flex flex-wrap gap-2'>
			{keywords.map(({ keyword, definition }) => (
				<span
					key={keyword}
					title={definition}
					className={`text-xs font-medium px-2.5 py-1 rounded-full cursor-help ${colorClasses[color]}`}
				>
					{keyword}
				</span>
			))}
		</div>
	);
};

const HighlightedResume: React.FC<{ resume: string; keywords: string[] }> = ({
	resume,
	keywords,
}) => {
	const highlightedText = useMemo(() => {
		if (!keywords.length) return resume;
		// Escape regex special characters in keywords and create a single regex
		const regex = new RegExp(
			`(${keywords
				.map((k) => k.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"))
				.join("|")})`,
			"gi"
		);

		return resume.split(regex).map((part, index) =>
			regex.test(part) ? (
				<mark
					key={index}
					className='bg-green-500/30 text-green-200 px-1 rounded'
				>
					{part}
				</mark>
			) : (
				part
			)
		);
	}, [resume, keywords]);

	return (
		<pre className='whitespace-pre-wrap font-sans text-sm bg-slate-900 p-4 rounded-md border border-slate-700'>
			{highlightedText}
		</pre>
	);
};

const MatchResult: React.FC<MatchResultProps> = ({
	analysis,
	resume,
	onSelectSuggestion,
}) => {
	const [coverLetter, setCoverLetter] = useState(analysis.coverLetterDraft);
	const [copied, setCopied] = useState(false);

	const handleCopy = () => {
		navigator.clipboard.writeText(coverLetter);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	const scoreColor =
		analysis.matchScore >= 75
			? "text-green-400"
			: analysis.matchScore >= 50
			? "text-yellow-400"
			: "text-red-400";

	const ProgressRing: React.FC<{ score: number }> = ({ score }) => {
		const radius = 50;
		const circumference = 2 * Math.PI * radius;
		const offset = circumference - (score / 100) * circumference;
		const strokeColor =
			score >= 75 ? "#4ade80" : score >= 50 ? "#facc15" : "#f87171";

		return (
			<div className='relative flex items-center justify-center w-32 h-32'>
				<svg
					className='transform -rotate-90'
					width='120'
					height='120'
					viewBox='0 0 120 120'
				>
					<circle
						cx='60'
						cy='60'
						r={radius}
						strokeWidth='10'
						className='text-slate-700'
						fill='transparent'
						stroke='currentColor'
					/>
					<circle
						cx='60'
						cy='60'
						r={radius}
						strokeWidth='10'
						stroke={strokeColor}
						fill='transparent'
						strokeDasharray={circumference}
						strokeDashoffset={offset}
						strokeLinecap='round'
						className='transition-all duration-1000 ease-in-out'
					/>
				</svg>
				<span className={`absolute text-3xl font-bold ${scoreColor}`}>
					{score}%
				</span>
			</div>
		);
	};

	return (
		<div className='space-y-6'>
			<div className='flex flex-col md:flex-row items-center gap-6 bg-slate-800 p-4 rounded-lg'>
				<ProgressRing score={analysis.matchScore} />
				<div className='flex-1 text-center md:text-left'>
					<h2 className='text-2xl font-bold text-white'>Analysis Complete</h2>
					<p className='text-slate-400 mt-1'>{analysis.summary}</p>
				</div>
			</div>

			<AnalysisSection
				title='Keyword Analysis'
				icon={<KeyIcon />}
				defaultOpen={true}
			>
				<div className='space-y-4'>
					<div>
						<h4 className='font-semibold text-green-400 mb-2'>
							Matched Keywords
						</h4>
						<KeywordCloud keywords={analysis.matchedKeywords} color='green' />
					</div>
					<div>
						<h4 className='font-semibold text-red-400 mb-2'>
							Missing Keywords (Gaps)
						</h4>
						<KeywordCloud keywords={analysis.missingKeywords} color='red' />
					</div>
				</div>
			</AnalysisSection>

			<AnalysisSection
				title='Actionable Suggestions'
				icon={<MagicWandIcon />}
				defaultOpen={true}
			>
				<div className='space-y-3'>
					{analysis.improvementSuggestions.map((suggestion, index) => (
						<div
							key={index}
							className='bg-slate-900/70 p-3 rounded-md border border-slate-700 flex flex-col sm:flex-row justify-between sm:items-center gap-3'
						>
							<div className='flex-1'>
								<span className='text-xs font-semibold uppercase text-indigo-400'>
									{suggestion.suggestionType}
								</span>
								<p className='text-sm text-slate-400 italic mt-1'>
									"{suggestion.originalText}"
								</p>
							</div>
							<button
								onClick={() => onSelectSuggestion(suggestion)}
								className='px-4 py-1.5 text-sm font-bold text-white bg-indigo-600 rounded-md hover:bg-indigo-500 transition-colors flex-shrink-0'
							>
								Review & Apply
							</button>
						</div>
					))}
				</div>
			</AnalysisSection>

			<AnalysisSection title='Highlighted Resume' icon={<DocumentTextIcon />}>
				<HighlightedResume
					resume={resume}
					keywords={analysis.matchedKeywords.map((k) => k.keyword)}
				/>
			</AnalysisSection>

			<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
				<AnalysisSection title='Strengths' icon={<CheckIcon />}>
					<ul className='list-disc list-inside space-y-2 text-slate-300'>
						{analysis.strengths.map((item, index) => (
							<li key={index}>{item}</li>
						))}
					</ul>
				</AnalysisSection>

				<AnalysisSection title='Potential Gaps' icon={<AlertIcon />}>
					<ul className='list-disc list-inside space-y-2 text-slate-300'>
						{analysis.gaps.map((item, index) => (
							<li key={index}>{item}</li>
						))}
					</ul>
				</AnalysisSection>
			</div>

			<AnalysisSection title='Tailor Your Cover Letter' icon={<DocumentIcon />}>
				<div className='relative'>
					<textarea
						value={coverLetter}
						onChange={(e) => setCoverLetter(e.target.value)}
						rows={15}
						className='w-full bg-slate-900 p-4 rounded-md text-slate-300 text-sm font-mono border border-slate-700 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition duration-150 ease-in-out'
						aria-label='Generated Cover Letter'
					/>
					<button
						onClick={handleCopy}
						className='absolute top-3 right-3 px-3 py-1 text-xs font-bold text-white bg-slate-700 rounded-md hover:bg-slate-600 transition-colors'
					>
						{copied ? "Copied!" : "Copy"}
					</button>
				</div>
			</AnalysisSection>
		</div>
	);
};

// Helper Icon Components
const CheckIcon = () => (
	<svg
		xmlns='http://www.w3.org/2000/svg'
		className='h-6 w-6 text-green-400'
		fill='none'
		viewBox='0 0 24 24'
		stroke='currentColor'
	>
		<path
			strokeLinecap='round'
			strokeLinejoin='round'
			strokeWidth={2}
			d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
		/>
	</svg>
);
const AlertIcon = () => (
	<svg
		xmlns='http://www.w3.org/2000/svg'
		className='h-6 w-6 text-yellow-400'
		fill='none'
		viewBox='0 0 24 24'
		stroke='currentColor'
	>
		<path
			strokeLinecap='round'
			strokeLinejoin='round'
			strokeWidth={2}
			d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
		/>
	</svg>
);
const KeyIcon = () => (
	<svg
		xmlns='http://www.w3.org/2000/svg'
		className='h-6 w-6 text-purple-400'
		fill='none'
		viewBox='0 0 24 24'
		stroke='currentColor'
	>
		<path
			strokeLinecap='round'
			strokeLinejoin='round'
			strokeWidth={2}
			d='M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H5v-2H3v-2H1v-4a6 6 0 016-6h7z'
		/>
	</svg>
);
const DocumentIcon = () => (
	<svg
		xmlns='http://www.w3.org/2000/svg'
		className='h-6 w-6 text-blue-400'
		fill='none'
		viewBox='0 0 24 24'
		stroke='currentColor'
	>
		<path
			strokeLinecap='round'
			strokeLinejoin='round'
			strokeWidth={2}
			d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
		/>
	</svg>
);
const DocumentTextIcon = () => (
	<svg
		xmlns='http://www.w3.org/2000/svg'
		className='h-6 w-6 text-teal-400'
		fill='none'
		viewBox='0 0 24 24'
		stroke='currentColor'
		strokeWidth={2}
	>
		<path
			strokeLinecap='round'
			strokeLinejoin='round'
			d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
		/>
	</svg>
);
const MagicWandIcon = () => (
	<svg
		xmlns='http://www.w3.org/2000/svg'
		className='h-6 w-6 text-indigo-400'
		fill='none'
		viewBox='0 0 24 24'
		stroke='currentColor'
		strokeWidth={2}
	>
		<path
			strokeLinecap='round'
			strokeLinejoin='round'
			d='M12 6.25278C12 6.25278 15.6364 2.61636 20 7.00001C24.3636 11.3836 20.7273 15.0199 20.7273 15.0199M12 6.25278C12 6.25278 8.36364 2.61636 4 7.00001C-0.363636 11.3836 3.27273 15.0199 3.27273 15.0199M12 6.25278L12 21.25'
		/>
	</svg>
);
const ChevronDownIcon = () => (
	<svg
		xmlns='http://www.w3.org/2000/svg'
		className='h-5 w-5 text-slate-400'
		fill='none'
		viewBox='0 0 24 24'
		stroke='currentColor'
	>
		<path
			strokeLinecap='round'
			strokeLinejoin='round'
			strokeWidth={2}
			d='M19 9l-7 7-7-7'
		/>
	</svg>
);

export default MatchResult;
