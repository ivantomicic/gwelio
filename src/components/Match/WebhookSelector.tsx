import { Link } from "lucide-react";
import { Webhook } from "../../types";

interface WebhookSelectorProps {
	webhooks: Webhook[];
	selectedWebhook: string | null;
	onChange: (webhookId: string | null) => void;
	label: string;
}

export function WebhookSelector({
	webhooks,
	selectedWebhook,
	onChange,
	label,
}: WebhookSelectorProps) {
	return (
		<div className="space-y-2">
			<div className="flex items-center space-x-2">
				<Link className="w-4 h-4 text-gray-400" />
				<label className="text-sm font-medium text-gray-700 dark:text-gray-300">
					{label}
				</label>
			</div>
			<select
				value={selectedWebhook || ""}
				onChange={(e) => onChange(e.target.value || null)}
				className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
			>
				<option value="">Select button</option>
				{webhooks.map((webhook) => (
					<option key={webhook.id} value={webhook.id}>
						{webhook.name}
					</option>
				))}
			</select>
		</div>
	);
}
