'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import clsx from 'clsx';

interface ThemeToggleProps {
	className?: string;
}

const ThemeToggle = ({ className }: ThemeToggleProps) => {
	const { theme, setTheme, resolvedTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	// Only run on client after hydration
	useEffect(() => {
		setMounted(true);
	}, []);

	// Wait for hydration to complete before showing theme-dependent content
	// This prevents server/client mismatch
	if (!mounted || !resolvedTheme) {
		// Return a placeholder that matches server render to prevent hydration mismatch
		return (
			<button
				aria-label="Toggle Dark Mode"
				className={clsx(
					'p-1 rounded-full border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 transition-colors',
					className,
				)}
				disabled
				suppressHydrationWarning
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					className="size-5"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth={2}
					strokeLinecap="round"
					strokeLinejoin="round"
					suppressHydrationWarning
				>
					<path d="M8 12a4 4 0 1 0 8 0a4 4 0 1 0-8 0m-5 0h1m8-9v1m8 8h1m-9 8v1M5.6 5.6l.7.7m12.1-.7l-.7.7m0 11.4l.7.7m-12.1-.7l-.7.7" />
				</svg>
			</button>
		);
	}

	const isDark = resolvedTheme === 'dark';

	return (
		<button
			aria-label="Toggle Dark Mode"
			onClick={() => setTheme(isDark ? 'light' : 'dark')}
			className={clsx(
				'p-1 rounded-full border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 transition-colors',
				className,
			)}
			suppressHydrationWarning
		>
			{isDark ? (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					className="size-5"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth={2}
					strokeLinecap="round"
					strokeLinejoin="round"
					suppressHydrationWarning
				>
					<path d="M12 3h.393a7.5 7.5 0 0 0 7.92 12.446A9 9 0 1 1 12 2.992z" />
				</svg>
			) : (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					className="size-5"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth={2}
					strokeLinecap="round"
					strokeLinejoin="round"
					suppressHydrationWarning
				>
					<path d="M8 12a4 4 0 1 0 8 0a4 4 0 1 0-8 0m-5 0h1m8-9v1m8 8h1m-9 8v1M5.6 5.6l.7.7m12.1-.7l-.7.7m0 11.4l.7.7m-12.1-.7l-.7.7" />
				</svg>
			)}
		</button>
	);
};

export default ThemeToggle;
