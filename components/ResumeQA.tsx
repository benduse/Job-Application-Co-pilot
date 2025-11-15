import React, { useState } from "react";
import { answerQuestionAboutResume } from "../services/geminiService";
import TextAreaInput from "./TextAreaInput";
import Loader from "./Loader";

interface ResumeQAProps {
	resume: string;
}

const ResumeQA: React.FC<ResumeQAProps> = ({ resume }) => {
	const [question, setQuestion] = useState("");
	const [answer, setAnswer] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleGetAnswer = async () => {
		if (!question.trim()) return;
		setIsLoading(true);
		setError(null);
		setAnswer("");
		try {
			const result = await answerQuestionAboutResume(resume, question);
			setAnswer(result);
		} catch (err: any) {
			setError(err.message || "Failed to get an answer.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className='mt-6 pt-6 border-t border-slate-700'>
			<h3 className='text-lg font-semibold text-white mb-3'>
				Answer Screening Questions
			</h3>
			<p className='text-sm text-slate-400 mb-4'>
				Paste a screening question from a job application and get a draft answer
				based on your resume.
			</p>
			<TextAreaInput
				id='qa-question'
				label='Screening Question'
				value={question}
				onChange={(e) => setQuestion(e.target.value)}
				placeholder='e.g., In 2-3 sentences, tell us about your experience managing both inbound and outbound leads...'
				rows={4}
				disabled={!resume.trim()}
			/>
			<div className='mt-4 flex justify-end'>
				<button
					onClick={handleGetAnswer}
					disabled={!resume.trim() || !question.trim() || isLoading}
					className='flex items-center justify-center px-6 py-2 text-sm font-bold text-white bg-indigo-600 rounded-md hover:bg-indigo-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors duration-150'
				>
					{isLoading ? <Loader /> : "Get Answer"}
				</button>
			</div>
			{error && (
				<div className='mt-4 bg-red-900/50 text-red-300 p-3 rounded-md text-sm'>
					<strong>Error:</strong> {error}
				</div>
			)}
			{answer && (
				<div className='mt-4'>
					<h4 className='text-md font-semibold text-slate-300 mb-2'>
						Suggested Answer:
					</h4>
					<div className='bg-slate-900 p-4 rounded-md whitespace-pre-wrap text-slate-300 text-sm font-mono border border-slate-700'>
						{answer}
					</div>
				</div>
			)}
		</div>
	);
};

export default ResumeQA;
