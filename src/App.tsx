import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import { AuthLayout } from "./components/Layout/AuthLayout";
import { DashboardLayout } from "./components/Layout/DashboardLayout";
import { SettingsScreen } from "./components/Settings/SettingsScreen";
import { ForgotPassword } from "./components/Auth/ForgotPassword";
import { ResetPassword } from "./components/Auth/ResetPassword";
import { Header } from "./components/Layout/Header";

function App() {
	const user = useAuthStore((state) => state.user);

	if (!user) {
		return (
			<Router>
				<Routes>
					<Route
						path="/auth/forgot-password"
						element={<ForgotPassword />}
					/>
					<Route
						path="/auth/reset-password"
						element={<ResetPassword />}
					/>
					<Route
						path="/reset-password"
						element={<AuthLayout view="reset-password" />}
					/>
					<Route path="/" element={<AuthLayout />}>
						<Route
							path="?code=:code"
							element={<AuthLayout view="reset-password" />}
						/>
					</Route>
				</Routes>
			</Router>
		);
	}

	return (
		<Router>
			<div className="min-h-screen bg-gray-50 dark:bg-gray-900">
				<Header />
				<main className="container mx-auto px-4 py-8">
					<Routes>
						<Route path="/" element={<DashboardLayout />} />
						<Route path="/settings" element={<SettingsScreen />} />
					</Routes>
				</main>
			</div>
		</Router>
	);
}

export default App;
