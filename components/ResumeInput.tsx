import React, { useState, useCallback } from "react";
import TextAreaInput from "./TextAreaInput";
import ResumeQA from "./ResumeQA";
import { extractTextFromFile } from "../services/geminiService";
import Loader from "./Loader";

interface ResumeInputProps {
	resume: string;
	setResume: (resume: string) => void;
}

const ResumeInput: React.FC<ResumeInputProps> = ({ resume, setResume }) => {
	const [isDragging, setIsDragging] = useState(false);
	const [showTextArea, setShowTextArea] = useState(!!resume);
	const [isExtractingText, setIsExtractingText] = useState(false);

	const handleFile = useCallback(
		async (file: File) => {
			if (!file) {
				return;
			}

			const extension = file.name.split(".").pop()?.toLowerCase();

			if (extension === "txt") {
				const reader = new FileReader();
				reader.onload = (e) => {
					const text = e.target?.result as string;
					setResume(text);
					setShowTextArea(true);
				};
				reader.readAsText(file);
			} else if (extension === "pdf" || extension === "docx") {
				setIsExtractingText(true);
				try {
					const base64Data = await new Promise<string>((resolve, reject) => {
						const reader = new FileReader();
						reader.onload = () =>
							resolve((reader.result as string).split(",")[1]);
						reader.onerror = (error) => reject(error);
						reader.readAsDataURL(file);
					});

					const mimeType =
						extension === "pdf"
							? "application/pdf"
							: "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

					const extractedText = await extractTextFromFile({
						mimeType,
						data: base64Data,
					});
					setResume(extractedText);
					setShowTextArea(true);
				} catch (err: any) {
					alert(
						err.message ||
							"Failed to extract text from the document. Please try a different file or paste the text manually."
					);
				} finally {
					setIsExtractingText(false);
				}
			} else {
				alert("Please upload a valid .txt, .pdf, or .docx file.");
			}
		},
		[setResume]
	);

	const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(true);
	}, []);

	const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);
	}, []);

	const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
	}, []);

	const handleDrop = useCallback(
		async (e: React.DragEvent<HTMLDivElement>) => {
			e.preventDefault();
			e.stopPropagation();
			setIsDragging(false);
			if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
				await handleFile(e.dataTransfer.files[0]);
				e.dataTransfer.clearData();
			}
		},
		[handleFile]
	);

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files.length > 0) {
			await handleFile(e.target.files[0]);
		}
	};

	return (
		<div className='bg-slate-800/50 p-6 rounded-lg border border-slate-700 h-full flex flex-col'>
			<div className='flex justify-between items-center mb-4'>
				<h2 className='text-2xl font-bold text-white'>Your Resume</h2>
			</div>
			<div
				onDragEnter={handleDragEnter}
				onDragLeave={handleDragLeave}
				onDragOver={handleDragOver}
				onDrop={handleDrop}
				className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ${
					isDragging || isExtractingText
						? "border-cyan-500 bg-slate-800"
						: "border-slate-600 hover:border-cyan-600"
				}`}
			>
				{isExtractingText ? (
					<div className='flex flex-col items-center justify-center text-slate-400 pointer-events-none'>
						<Loader />
						<p className='mt-2 font-semibold'>
							Extracting text from document...
						</p>
					</div>
				) : (
					<>
						<input
							type='file'
							id='resume-upload'
							className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
							onChange={handleFileChange}
							accept='.txt,.pdf,.docx'
						/>
						<div className='flex flex-col items-center justify-center text-slate-400 pointer-events-none'>
							<UploadIcon />
							<p className='mt-2 font-semibold'>Drag & drop your resume</p>
							<p className='text-sm'>or click to browse (.txt, .pdf, .docx)</p>
						</div>
					</>
				)}
			</div>
			<div className='text-center my-4'>
				<button
					onClick={() => setShowTextArea(!showTextArea)}
					className='text-sm text-cyan-400 hover:text-cyan-300'
				>
					{showTextArea ? "Hide pasted text" : "Or paste resume as text"}
				</button>
			</div>
			{showTextArea && (
				<TextAreaInput
					id='resume-input'
					label='Resume Content'
					value={resume}
					onChange={(e) => setResume(e.target.value)}
					placeholder='e.g., John Doe - Software Engineer...'
					rows={15}
				/>
			)}
			{resume.trim() && <ResumeQA resume={resume} />}
		</div>
	);
};

const UploadIcon = () => (
	<svg
		xmlns='http://www.w3.org/2000/svg'
		className='h-10 w-10 text-slate-500'
		fill='none'
		viewBox='0 0 24 24'
		stroke='currentColor'
		strokeWidth={2}
	>
		<path
			strokeLinecap='round'
			strokeLinejoin='round'
			d='M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12'
		/>
	</svg>
);

export default ResumeInput;
