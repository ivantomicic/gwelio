import React, { useEffect, useState } from "react";
import { TempMatch, User } from "../../types";
import { getAllUsers } from "../../lib/supabase";
import { Target, Plus, Trophy } from "lucide-react";
import { updateTempMatchSet } from "../../lib/matches";
import { checkSetComplete } from "../../lib/scoring";
import toast from "react-hot-toast";

interface ActiveMatchProps {
	match: TempMatch;
	onCancel: () => void;
	onComplete: (match: TempMatch, sets: any[]) => void;
}

export function ActiveMatch({ match, onCancel, onComplete }: ActiveMatchProps) {
	const [users, setUsers] = useState<User[]>([]);
	const [currentSet, setCurrentSet] = useState(1);
	const [player1Score, setPlayer1Score] = useState(0);
	const [player2Score, setPlayer2Score] = useState(0);
	const [completedSets, setCompletedSets] = useState<
		Array<{
			player1Score: number;
			player2Score: number;
		}>
	>([]);

	useEffect(() => {
		async function loadUsers() {
			const allUsers = await getAllUsers();
			setUsers(allUsers);
		}
		loadUsers();
	}, []);

	const getPlayerName = (id: string) => {
		const user = users.find((u) => u.id === id);
		return user?.full_name || "Loading...";
	};

	const startNewSet = (
		finalPlayer1Score: number,
		finalPlayer2Score: number
	) => {
		console.log("Starting new set with scores to save:", {
			finalPlayer1Score,
			finalPlayer2Score,
		});
		setCompletedSets((prev) => {
			console.log("Previous completed sets:", prev);
			const newSets = [
				...prev,
				{
					player1Score: finalPlayer1Score,
					player2Score: finalPlayer2Score,
				},
			];
			console.log("New completed sets:", newSets);
			return newSets;
		});
		setCurrentSet((prev) => prev + 1);
		setPlayer1Score(0);
		setPlayer2Score(0);
	};

	const handleScoreUpdate = async (playerId: string) => {
		try {
			const isPlayer1 = playerId === match.player1_id;
			const newPlayer1Score = isPlayer1 ? player1Score + 1 : player1Score;
			const newPlayer2Score = isPlayer1 ? player2Score : player2Score + 1;

			console.log("Updating score:", {
				isPlayer1,
				newPlayer1Score,
				newPlayer2Score,
				currentSet,
				completedSets,
			});

			// Update local state first
			if (isPlayer1) {
				setPlayer1Score(newPlayer1Score);
			} else {
				setPlayer2Score(newPlayer2Score);
			}

			// Update database
			await updateTempMatchSet(
				match.id,
				currentSet,
				newPlayer1Score,
				newPlayer2Score
			);

			// Check if set is complete with new scores
			const setResult = checkSetComplete(
				newPlayer1Score,
				newPlayer2Score
			);

			console.log("Set complete check:", {
				setResult,
				currentSet,
				completedSets,
			});

			if (setResult.isComplete) {
				toast.success(`Set ${currentSet} complete!`);
				// Add current set to completed sets
				setCompletedSets((prev) => [
					...prev,
					{
						player1Score: newPlayer1Score,
						player2Score: newPlayer2Score,
					},
				]);

				// Reset scores for next set
				setPlayer1Score(0);
				setPlayer2Score(0);
				setCurrentSet((prev) => prev + 1);
			}
		} catch (error) {
			console.error("Error updating score:", error);
			toast.error("Failed to update score");

			// Revert local state on error
			if (isPlayer1) {
				setPlayer1Score(player1Score);
			} else {
				setPlayer2Score(player2Score);
			}
		}
	};

	const handleSubmit = () => {
		console.log("Submitting match:", {
			completedSets,
			currentScores: {
				player1Score,
				player2Score,
			},
		});

		// Include the current set if it has any points
		const allSets = [...completedSets];
		if (player1Score > 0 || player2Score > 0) {
			allSets.push({
				player1Score,
				player2Score,
			});
		}

		console.log("Final sets to submit:", allSets);
		onComplete(match, allSets);
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div className="flex items-center space-x-3">
					<div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900">
						<Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
					</div>
					<h3 className="text-lg font-medium text-gray-900 dark:text-white">
						Active Match
					</h3>
				</div>
				<button
					onClick={onCancel}
					className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
				>
					Cancel Match
				</button>
			</div>

			<div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
				{/* Completed Sets */}
				{completedSets.length > 0 && (
					<div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
						<h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Completed Sets
						</h4>
						<div className="space-y-2">
							{completedSets.map((set, index) => (
								<div
									key={index}
									className="flex justify-center space-x-4 text-sm"
								>
									<span className="text-gray-600 dark:text-gray-400">
										Set {index + 1}:
									</span>
									<span className="font-medium text-gray-900 dark:text-white">
										{set.player1Score} - {set.player2Score}
									</span>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Current Set */}
				<div className="grid grid-cols-3 gap-4 text-center">
					<div>
						<p className="text-sm text-gray-500 dark:text-gray-400">
							Player 1
						</p>
						<p className="text-lg font-medium text-gray-900 dark:text-white">
							{getPlayerName(match.player1_id)}
						</p>
						<div className="flex items-center justify-center space-x-2 mt-2">
							<p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
								{player1Score}
							</p>
							<button
								onClick={() =>
									handleScoreUpdate(match.player1_id)
								}
								className="p-1 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400"
								title="Add point"
							>
								<Plus className="w-5 h-5" />
							</button>
						</div>
					</div>

					<div className="flex flex-col items-center justify-center">
						<p className="text-sm text-gray-500 dark:text-gray-400">
							Current Set
						</p>
						<p className="text-2xl font-bold text-gray-900 dark:text-white">
							{currentSet}
						</p>
					</div>

					<div>
						<p className="text-sm text-gray-500 dark:text-gray-400">
							Player 2
						</p>
						<p className="text-lg font-medium text-gray-900 dark:text-white">
							{getPlayerName(match.player2_id)}
						</p>
						<div className="flex items-center justify-center space-x-2 mt-2">
							<p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
								{player2Score}
							</p>
							<button
								onClick={() =>
									handleScoreUpdate(match.player2_id)
								}
								className="p-1 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400"
								title="Add point"
							>
								<Plus className="w-5 h-5" />
							</button>
						</div>
					</div>
				</div>

				<div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
					<p>
						First to 11 points wins the set (with 2 point
						difference)
					</p>
					<p className="mt-1">
						Set will automatically advance when complete
					</p>
				</div>
			</div>

			<button
				onClick={handleSubmit}
				className="w-full flex items-center justify-center space-x-2 px-6 py-2.5 bg-green-600 dark:bg-green-500 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600"
			>
				<Trophy className="w-4 h-4" />
				<span>Submit Match</span>
			</button>
		</div>
	);
}
