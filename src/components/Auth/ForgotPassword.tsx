import React, { useState } from "react";
import { Mail, Check, ArrowLeft } from "lucide-react";
import { resetPassword } from "../../lib/supabase";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

export function ForgotPassword() {
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);
	const [isEmailSent, setIsEmailSent] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		try {
			await resetPassword(email);
			setIsEmailSent(true);
		} catch (error) {
			console.error("Error sending reset password email:", error);
			toast.error("Greška pri slanju linka za resetovanje lozinke");
		} finally {
			setLoading(false);
		}
	};

	if (isEmailSent) {
		return (
			<div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
				<div className="w-full max-w-md space-y-6">
					<div className="text-center">
						<div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
							<Check className="w-6 h-6 text-green-600 dark:text-green-400" />
						</div>
						<h2 className="text-2xl font-bold text-gray-900 dark:text-white">
							Proverite vaš email
						</h2>
						<p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
							Poslali smo link za resetovanje lozinke na {email}
						</p>
					</div>

					<div className="space-y-4">
						<p className="text-sm text-gray-600 dark:text-gray-400 text-center">
							Niste dobili email? Proverite spam folder ili
							zatražite novi link.
						</p>
						<div className="flex justify-center">
							<Link
								to="/"
								className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
							>
								<ArrowLeft className="w-4 h-4 mr-2" />
								Nazad na prijavu
							</Link>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
			<div className="w-full max-w-md space-y-6">
				<div className="text-center">
					<h2 className="text-2xl font-bold text-gray-900 dark:text-white">
						Zaboravili ste lozinku?
					</h2>
					<p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
						Unesite vašu email adresu i poslaćemo vam link za
						resetovanje lozinke.
					</p>
				</div>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
							Email adresa
						</label>
						<div className="mt-1 relative">
							<Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-5 w-5" />
							<input
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="pl-10 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
								required
							/>
						</div>
					</div>

					<button
						type="submit"
						disabled={loading}
						className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors disabled:opacity-50"
					>
						{loading ? "Slanje..." : "Pošalji link za resetovanje"}
					</button>

					<Link
						to="/"
						className="block text-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
					>
						Nazad na prijavu
					</Link>
				</form>
			</div>
		</div>
	);
}
