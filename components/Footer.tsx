import React from "react";

interface FooterProps {
	onPrivacyClick: () => void;
	onAboutClick: () => void;
	onDistanceClick: () => void;
}

const Footer: React.FC<FooterProps> = ({
	onPrivacyClick,
	onAboutClick,
	onDistanceClick,
}) => {
	return (
		<footer className='bg-slate-900/50 border-t border-slate-800 mt-12'>
			<div className='container mx-auto px-6 py-8 text-center text-slate-400'>
				<div className='flex justify-center space-x-6 mb-4'>
					<button
						onClick={onAboutClick}
						className='hover:text-cyan-400 transition-colors'
					>
						About
					</button>
					<button
						onClick={onPrivacyClick}
						className='hover:text-cyan-400 transition-colors'
					>
						Privacy Policy
					</button>
					<button
						onClick={onDistanceClick}
						className='hover:text-cyan-400 transition-colors'
					>
						Check Commute
					</button>
					<a
						href='mailto:support@example.com'
						className='hover:text-cyan-400 transition-colors'
					>
						Contact Us
					</a>
				</div>
				<p className='text-sm text-slate-500'>Powered by Google Gemini</p>
			</div>
		</footer>
	);
};

export default Footer;
