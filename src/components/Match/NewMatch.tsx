import React, { useState, useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import { createMatch } from "../../lib/matches";
import { getAllUsers } from "../../lib/supabase";
import { Set, User } from "../../types";
import { fireConfetti } from "../../lib/confetti";
import {
	Plus,
	User as UserIcon,
	Target,
	Trophy,
	ChevronDown,
	X,
} from "lucide-react";
import toast from "react-hot-toast";

interface NewMatchProps {
	onMatchCreated: (match: any) => void;
}

export function NewMatch({ onMatchCreated }: NewMatchProps) {
	const [opponent, setOpponent] = useState("");
	const [sets, setSets] = useState<Set[]>([
		{ player1Score: 0, player2Score: 0 },
	]);
	const [users, setUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState(true);
	const [isSelectOpen, setIsSelectOpen] = useState(false);
	const user = useAuthStore((state) => state.user);

	useEffect(() => {
		async function fetchUsers() {
			if (!user) return;
			try {
				const allUsers = await getAllUsers();
				const opponents = allUsers.filter((u) => u.id !== user.id);
				setUsers(opponents);
			} catch (error) {
				console.error("Greška pri učitavanju protivnika:", error);
				toast.error("Greška pri učitavanju protivnika");
			} finally {
				setLoading(false);
			}
		}

		fetchUsers();
	}, [user]);

	const selectedOpponent = users.find((u) => u.id === opponent);

	const handleSetChange = (
		index: number,
		player: "player1" | "player2",
		value: number
	) => {
		const newSets = [...sets];
		if (player === "player1") {
			newSets[index].player1Score = Math.max(0, Math.min(99, value));
		} else {
			newSets[index].player2Score = Math.max(0, Math.min(99, value));
		}
		setSets(newSets);
	};

	const addSet = () => {
		setSets([...sets, { player1Score: 0, player2Score: 0 }]);
	};

	const removeSet = (index: number) => {
		if (sets.length > 1) {
			const newSets = sets.filter((_, i) => i !== index);
			setSets(newSets);
		}
	};

	const calculateTotalScore = () => {
		return sets.reduce(
			(acc, set) => {
				if (set.player1Score > set.player2Score) acc.player1++;
				else if (set.player2Score > set.player1Score) acc.player2++;
				return acc;
			},
			{ player1: 0, player2: 0 }
		);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!user) return;

		const totalScore = calculateTotalScore();

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
			fireConfetti(); // Fire confetti on successful submission

			setOpponent("");
			setSets([{ player1Score: 0, player2Score: 0 }]);
		} catch (error) {
			console.error("Greška pri prijavi meča:", error);
			toast.error("Greška pri prijavi meča");
		}
	};

	if (!user) {
		return (
			<div className="text-center text-gray-600 dark:text-gray-400">
				Prijavi se da bi mogao prijaviti meč
			</div>
		);
	}

	if (loading) {
		return (
			<div className="flex items-center justify-center p-4">
				<div className="text-gray-600 dark:text-gray-400">
					Učitavanje protivnika...
				</div>
			</div>
		);
	}

	if (users.length === 0) {
		return (
			<div className="text-center text-gray-600 dark:text-gray-400">
				Nema drugih igrača
			</div>
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
						Odaberi protivnika
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
									: "Izaberi protivnika"}
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

			{/* Score Input */}
			{opponent && (
				<div className="relative">
					<div className="flex items-center space-x-3 mb-3">
						<div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 dark:bg-green-900">
							<Target className="w-4 h-4 text-green-600 dark:text-green-400" />
						</div>
						<h3 className="text-lg font-medium text-gray-900 dark:text-white">
							Unesi rezultate
						</h3>
					</div>

					<div className="space-y-4">
						<div className="grid grid-cols-2 gap-4 mb-2">
							<div className="text-center text-sm font-medium text-gray-700 dark:text-gray-300">
								Tvoj rezultat
							</div>
							<div className="text-center text-sm font-medium text-gray-700 dark:text-gray-300">
								{selectedOpponent?.full_name} rezultat
							</div>
						</div>

						{sets.map((set, index) => (
							<div
								key={index}
								className="flex items-center space-x-3"
							>
								<div className="w-16 text-sm text-gray-500 dark:text-gray-400">
									Set {index + 1}
								</div>
								<div className="flex-1 grid grid-cols-2 gap-4">
									<input
										type="number"
										value={set.player1Score}
										onChange={(e) =>
											handleSetChange(
												index,
												"player1",
												parseInt(e.target.value) || 0
											)
										}
										className="w-full text-center rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
										min="0"
										max="99"
									/>
									<input
										type="number"
										value={set.player2Score}
										onChange={(e) =>
											handleSetChange(
												index,
												"player2",
												parseInt(e.target.value) || 0
											)
										}
										className="w-full text-center rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
										min="0"
										max="99"
									/>
								</div>
								{sets.length > 1 && (
									<button
										type="button"
										onClick={() => removeSet(index)}
										className="p-1 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
									>
										<X className="h-5 w-5" />
									</button>
								)}
							</div>
						))}

						<button
							type="button"
							onClick={addSet}
							className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
						>
							<Plus className="w-4 h-4" />
							<span>Dodaj set</span>
						</button>
					</div>
				</div>
			)}

			{/* Submit Button */}
			<button
				type="submit"
				disabled={!opponent}
				className="w-full flex items-center justify-center space-x-2 px-6 py-2.5 bg-green-600 dark:bg-green-500 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
			>
				<Trophy className="w-4 h-4" />
				<span>Prijavi meč</span>
			</button>
		</form>
	);
}