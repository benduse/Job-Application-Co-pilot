import React, { useState } from "react";

const NavLink: React.FC<{
	href?: string;
	onClick?: () => void;
	children: React.ReactNode;
}> = ({ href, onClick, children }) => {
	const classes =
		"block px-4 py-2 text-slate-300 rounded-md hover:bg-slate-700 hover:text-white transition-colors";
	if (onClick) {
		return (
			<button onClick={onClick} className={`w-full text-left ${classes}`}>
				{children}
			</button>
		);
	}
	return (
		<a href={href} className={classes}>
			{children}
		</a>
	);
};

interface HeaderProps {
	onAboutClick: () => void;
	onNavigateToListings: () => void;
	onNavigateToResumes: () => void;
	onNavigateToJobSearch: () => void;
	onNavigateToAgencies: () => void;
	onNavigateToHiringCafe: () => void;
}

const Header: React.FC<HeaderProps> = ({
	onAboutClick,
	onNavigateToListings,
	onNavigateToResumes,
	onNavigateToJobSearch,
	onNavigateToAgencies,
	onNavigateToHiringCafe,
}) => {
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	const navItems = [
		{ name: "Cover Letters", action: () => {}, isExternal: true },
		{ name: "Agencies", action: onNavigateToAgencies },
		{ name: "Dashboard", action: onNavigateToListings },
	];

	return (
		<header className='bg-slate-900/70 backdrop-blur-sm sticky top-0 z-50 shadow-md'>
			<div className='container mx-auto px-4 md:px-6'>
				<div className='flex items-center justify-between h-16'>
					{/* Logo/Title */}
					<div className='flex-shrink-0'>
						<button
							onClick={onNavigateToListings}
							className='text-xl md:text-2xl font-bold text-cyan-400 text-left'
						>
							Job Application Co-Pilot
						</button>
					</div>

					{/* Desktop Navigation */}
					<nav className='hidden md:flex md:items-center md:space-x-2'>
						<button
							onClick={onAboutClick}
							className='px-3 py-2 text-sm font-medium text-slate-300 rounded-md hover:bg-slate-700 hover:text-white transition-colors'
						>
							About
						</button>
						<button
							onClick={onNavigateToResumes}
							className='px-3 py-2 text-sm font-medium text-slate-300 rounded-md hover:bg-slate-700 hover:text-white transition-colors'
						>
							Resumes
						</button>
						<button
							onClick={onNavigateToJobSearch}
							className='px-3 py-2 text-sm font-medium text-slate-300 rounded-md hover:bg-slate-700 hover:text-white transition-colors'
						>
							Search Jobs
						</button>
						<button
							onClick={onNavigateToHiringCafe}
							className='px-3 py-2 text-sm font-medium text-slate-300 rounded-md hover:bg-slate-700 hover:text-white transition-colors'
						>
							Hiring.cafe
						</button>

						{navItems.map((item) => (
							<button
								key={item.name}
								onClick={item.action}
								className='px-3 py-2 text-sm font-medium text-slate-300 rounded-md hover:bg-slate-700 hover:text-white transition-colors'
							>
								{item.name}
							</button>
						))}
					</nav>

					{/* Mobile Menu Button */}
					<div className='md:hidden'>
						<button
							onClick={() => setIsMenuOpen(!isMenuOpen)}
							className='inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white'
							aria-expanded={isMenuOpen}
						>
							<span className='sr-only'>Open main menu</span>
							{isMenuOpen ? <CloseIcon /> : <MenuIcon />}
						</button>
					</div>
				</div>
			</div>

			{/* Mobile Menu */}
			{isMenuOpen && (
				<div className='md:hidden' id='mobile-menu'>
					<div className='px-2 pt-2 pb-3 space-y-1 sm:px-3'>
						<NavLink
							onClick={() => {
								onAboutClick();
								setIsMenuOpen(false);
							}}
						>
							About
						</NavLink>
						<NavLink
							onClick={() => {
								onNavigateToResumes();
								setIsMenuOpen(false);
							}}
						>
							Resumes
						</NavLink>
						<NavLink
							onClick={() => {
								onNavigateToJobSearch();
								setIsMenuOpen(false);
							}}
						>
							Search Jobs
						</NavLink>
						<NavLink
							onClick={() => {
								onNavigateToHiringCafe();
								setIsMenuOpen(false);
							}}
						>
							Hiring cafe
						</NavLink>
						{navItems.map((item) => (
							<NavLink
								key={item.name}
								onClick={() => {
									item.action();
									setIsMenuOpen(false);
								}}
							>
								{item.name}
							</NavLink>
						))}
					</div>
				</div>
			)}
		</header>
	);
};

const MenuIcon = () => (
	<svg
		className='block h-6 w-6'
		xmlns='http://www.w3.org/2000/svg'
		fill='none'
		viewBox='0 0 24 24'
		stroke='currentColor'
		aria-hidden='true'
	>
		<path
			strokeLinecap='round'
			strokeLinejoin='round'
			strokeWidth={2}
			d='M4 6h16M4 12h16M4 18h16'
		/>
	</svg>
);

const CloseIcon = () => (
	<svg
		className='block h-6 w-6'
		xmlns='http://www.w3.org/2000/svg'
		fill='none'
		viewBox='0 0 24 24'
		stroke='currentColor'
		aria-hidden='true'
	>
		<path
			strokeLinecap='round'
			strokeLinejoin='round'
			strokeWidth={2}
			d='M6 18L18 6M6 6l12 12'
		/>
	</svg>
);

export default Header;
