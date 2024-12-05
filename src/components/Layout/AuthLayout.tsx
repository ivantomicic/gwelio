import React, { useState, useEffect } from "react";
import { LoginForm } from "../Auth/LoginForm";
import { RegisterForm } from "../Auth/RegisterForm";
import { ThemeToggle } from "../Theme/ThemeToggle";
import { Toaster } from "react-hot-toast";
import { useThemeStore } from "../../store/themeStore";

const quotes = [
	"It is better to die like a tiger, than to live like a pussy.",
	'Ping pong, or as the Chinese say: "Ping pong".',
	"Less talkie-talkie, more ping-pong.",
];

export function AuthLayout() {
	const [showLogin, setShowLogin] = useState(true);
	const [quote, setQuote] = useState("");
	const isDark = useThemeStore((state) => state.isDark);

	useEffect(() => {
		// Set random quote on mount
		const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
		setQuote(randomQuote);
	}, []);

	useEffect(() => {
		if (isDark) {
			document.documentElement.classList.add("dark");
		} else {
			document.documentElement.classList.remove("dark");
		}
	}, [isDark]);

	return (
		<div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
			<div className="absolute top-4 right-4">
				<ThemeToggle />
			</div>
			<div className="w-full max-w-md space-y-8">
				<div className="text-center">
					<img
						src="/logo.png"
						alt="Gweilo Logo"
						className="mx-auto h-12 w-12"
					/>
					<h2 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
						Gweilo
					</h2>
					<p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
						{quote}
					</p>
				</div>
				{showLogin ? (
					<>
						<LoginForm />
						<p className="text-center text-sm text-gray-600 dark:text-gray-400">
							Nemaš nalog?{" "}
							<button
								onClick={() => setShowLogin(false)}
								className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
							>
								Registruj se
							</button>
						</p>
					</>
				) : (
					<>
						<RegisterForm onToggle={() => setShowLogin(true)} />
						<p className="text-center text-sm text-gray-600 dark:text-gray-400">
							Imaš nalog?{" "}
							<button
								onClick={() => setShowLogin(true)}
								className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
							>
								Prijavi se
							</button>
						</p>
					</>
				)}
			</div>
			<Toaster position="top-right" />
		</div>
	);
}
