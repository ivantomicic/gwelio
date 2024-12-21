import { Handler } from "@netlify/functions";

export const handler: Handler = async (event, context) => {
	// Only allow POST requests
	if (event.httpMethod !== "POST") {
		return {
			statusCode: 405,
			body: JSON.stringify({ error: "Method not allowed" }),
		};
	}

	try {
		// Get buttonId from path parameter
		const buttonId = event.path.split("/").pop();

		// Validate buttonId format
		if (!buttonId?.match(/^button\d+scoreup$/)) {
			return {
				statusCode: 400,
				body: JSON.stringify({ error: "Invalid button ID format" }),
			};
		}

		// Parse the request body
		const body = JSON.parse(event.body || "{}");
		const scoreIncrease = 1;

		// Log the incoming webhook for debugging
		console.log(`Webhook received for ${buttonId}:`, {
			body,
			scoreIncrease,
		});

		return {
			statusCode: 200,
			body: JSON.stringify({
				success: true,
				message: `Score increased for ${buttonId}`,
				scoreIncrease,
			}),
		};
	} catch (error) {
		console.error("Error processing webhook:", error);
		return {
			statusCode: 500,
			body: JSON.stringify({ error: "Failed to process score update" }),
		};
	}
};
