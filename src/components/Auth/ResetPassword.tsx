import React, { useState, useEffect } from "react";
import { Lock } from "lucide-react";
import { updatePasswordWithToken } from "../../lib/supabase";
import toast from "react-hot-toast";
import { useNavigate, useSearchParams } from "react-router-dom";

export function ResetPassword() {
	const [searchParams] = useSearchParams();
	const code = searchParams.get("code");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();

	useEffect(() => {
		if (!code) {
			toast.error("Invalid reset link");
			navigate("/");
			return;
		}
	}, [code, navigate]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (newPassword !== confirmPassword) {
			toast.error("Passwords do not match");
			return;
		}

		if (newPassword.length < 6) {
			toast.error("Password must be at least 6 characters");
			return;
		}

		setLoading(true);
		try {
			const { error } = await updatePasswordWithToken(code, newPassword);

			if (error) {
				throw error;
			}

			toast.success("Password updated successfully");
			navigate("/login");
		} catch (error: any) {
			console.error("Password reset error:", error);
			toast.error(error.message || "Failed to reset password");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
			<div className="w-full max-w-md space-y-8">
				<div className="text-center">
					<h2 className="text-2xl font-bold text-gray-900 dark:text-white">
						Resetujte vašu lozinku
					</h2>
					<p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
						Unesite novu lozinku
					</p>
				</div>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
							Nova lozinka
						</label>
						<div className="mt-1 relative">
							<Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-5 w-5" />
							<input
								type="password"
								value={newPassword}
								onChange={(e) => setNewPassword(e.target.value)}
								className="pl-10 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
								required
								minLength={6}
							/>
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
							Potvrdite novu lozinku
						</label>
						<div className="mt-1 relative">
							<Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-5 w-5" />
							<input
								type="password"
								value={confirmPassword}
								onChange={(e) =>
									setConfirmPassword(e.target.value)
								}
								className="pl-10 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
								required
								minLength={6}
							/>
						</div>
					</div>

					<button
						type="submit"
						disabled={loading}
						className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors disabled:opacity-50"
					>
						{loading ? "Ažuriranje..." : "Resetuj lozinku"}
					</button>
				</form>
			</div>
		</div>
	);
}
