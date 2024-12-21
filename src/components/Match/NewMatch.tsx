import React, { useState, useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import { createTempMatch, createMatch, getTempMatch } from "../../lib/matches";
import { getAllUsers } from "../../lib/supabase";
import { getWebhooks } from "../../lib/webhooks";
import { User, Webhook, TempMatch, Match, MatchSet } from "../../types";
import { fireConfetti } from "../../lib/confetti";
import { WebhookSelector } from "./WebhookSelector";
import { ActiveMatch } from "./ActiveMatch";
import { User as UserIcon, Trophy, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";
import { supabase } from "../../lib/supabase";

interface NewMatchProps {
	onMatchCreated: (match: TempMatch | Match) => void;
}

export function NewMatch({ onMatchCreated }: NewMatchProps) {
	const [opponent, setOpponent] = useState("");
	const [users, setUsers] = useState<User[]>([]);
	const [webhooks, setWebhooks] = useState<Webhook[]>([]);
	const [loading, setLoading] = useState(true);
	const [isSelectOpen, setIsSelectOpen] = useState(false);
	const [player1Webhook, setPlayer1Webhook] = useState<string | null>(null);
	const [player2Webhook, setPlayer2Webhook] = useState<string | null>(null);
	const [activeMatch, setActiveMatch] = useState<TempMatch | null>(null);
	const user = useAuthStore((state) => state.user);

	useEffect(() => {
		async function fetchData() {
			if (!user) return;
			try {
				const [allUsers, allWebhooks] = await Promise.all([
					getAllUsers(),
					getWebhooks(),
				]);
				const opponents = allUsers.filter((u) => u.id !== user.id);
				setUsers(opponents);
				setWebhooks(allWebhooks);
			} catch (error) {
				console.error("Error loading data:", error);
				toast.error("Error loading data");
			} finally {
				setLoading(false);
			}
		}
		fetchData();
	}, [user]);

	useEffect(() => {
		async function checkForActiveMatch() {
			if (!user) return;

			try {
				// Get all temp matches where user is player1
				const { data: tempMatches, error } = await supabase
					.from("temp_matches")
					.select("*")
					.eq("player1_id", user.id)
					.limit(1)
					.single();

				if (error) {
					if (error.code !== "PGRST116") {
						// Not found error
						console.error(
							"Error checking for active match:",
							error
						);
					}
					return;
				}

				if (tempMatches) {
					setActiveMatch(tempMatches);
					setOpponent(tempMatches.player2_id);
					setPlayer1Webhook(tempMatches.player1_webhook_id);
					setPlayer2Webhook(tempMatches.player2_webhook_id);
				}
			} catch (error) {
				console.error("Error checking for active match:", error);
			}
		}

		checkForActiveMatch();
	}, [user]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!user) return;

		try {
			const match = await createTempMatch(
				user.id,
				opponent,
				player1Webhook,
				player2Webhook
			);

			setActiveMatch(match);
			toast.success("Match started!");
			fireConfetti();
		} catch (error) {
			console.error("Error creating match:", error);
			toast.error("Failed to create match");
		}
	};

	const handleCancelMatch = () => {
		setActiveMatch(null);
		setOpponent("");
		setPlayer1Webhook(null);
		setPlayer2Webhook(null);
	};

	const handleMatchComplete = async (match: TempMatch, sets: MatchSet[]) => {
		if (!user) return;

		const totalScore = sets.reduce(
			(acc, set) => {
				if (set.player1Score > set.player2Score) acc.player1++;
				else if (set.player2Score > set.player1Score) acc.player2++;
				return acc;
			},
			{ player1: 0, player2: 0 }
		);

		try {
			const newMatch = await createMatch(
				user.id,
				opponent,
				totalScore.player1,
				totalScore.player2,
				sets
			);

			onMatchCreated(newMatch);
			toast.success("Match submitted for confirmation");
			fireConfetti();

			// Reset the form
			setActiveMatch(null);
			setOpponent("");
			setPlayer1Webhook(null);
			setPlayer2Webhook(null);
		} catch (error) {
			console.error("Error submitting match:", error);
			toast.error("Failed to submit match");
		}
	};

	const selectedOpponent = users.find((u) => u.id === opponent);

	if (!user) {
		return (
			<div className="text-center text-gray-600 dark:text-gray-400">
				Please sign in to create a match
			</div>
		);
	}

	if (loading) {
		return (
			<div className="text-center text-gray-600 dark:text-gray-400">
				Loading...
			</div>
		);
	}

	if (activeMatch) {
		return (
			<ActiveMatch
				match={activeMatch}
				onCancel={handleCancelMatch}
				onComplete={handleMatchComplete}
			/>
		);
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			{/* Opponent Selection */}
			<div className="relative">
				<div className="flex items-center space-x-3 mb-3">
					<div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900">
						<UserIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
					</div>
					<h3 className="text-lg font-medium text-gray-900 dark:text-white">
						Select Opponent
					</h3>
				</div>

				<div className="relative">
					<button
						type="button"
						onClick={() => setIsSelectOpen(!isSelectOpen)}
						className="w-full px-4 py-2.5 text-left bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
					>
						<div className="flex items-center justify-between">
							<span
								className={
									selectedOpponent
										? "text-gray-900 dark:text-white"
										: "text-gray-500 dark:text-gray-400"
								}
							>
								{selectedOpponent
									? selectedOpponent.full_name
									: "Choose opponent"}
							</span>
							<ChevronDown className="w-5 h-5 text-gray-400 dark:text-gray-500" />
						</div>
					</button>

					{isSelectOpen && (
						<div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
							<div className="py-1 max-h-60 overflow-auto">
								{users.map((user) => (
									<button
										key={user.id}
										type="button"
										onClick={() => {
											setOpponent(user.id);
											setIsSelectOpen(false);
										}}
										className={`w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 ${
											opponent === user.id
												? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
												: "text-gray-900 dark:text-white"
										}`}
									>
										{user.full_name}
									</button>
								))}
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Webhook Selection */}
			{opponent && (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<WebhookSelector
						webhooks={webhooks}
						selectedWebhook={player1Webhook}
						onChange={setPlayer1Webhook}
						label="Your Button"
					/>
					<WebhookSelector
						webhooks={webhooks}
						selectedWebhook={player2Webhook}
						onChange={setPlayer2Webhook}
						label={`${selectedOpponent?.full_name}'s Button`}
					/>
				</div>
			)}

			{/* Submit Button */}
			<button
				type="submit"
				disabled={!opponent}
				className="w-full flex items-center justify-center space-x-2 px-6 py-2.5 bg-green-600 dark:bg-green-500 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
			>
				<Trophy className="w-4 h-4" />
				<span>Start Match</span>
			</button>
		</form>
	);
}
