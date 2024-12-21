import type { Handler } from "@netlify/functions";

export const handler: Handler = async (event) => {
	// Log incoming request for debugging
	console.log({
		path: event.path,
		method: event.httpMethod,
		headers: event.headers,
	});

	// Handle CORS preflight
	if (event.httpMethod === "OPTIONS") {
		return {
			statusCode: 204,
			headers: {
				"Access-Control-Allow-Origin": "*",
				"Access-Control-Allow-Headers": "Content-Type",
				"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
			},
		};
	}

	// Only allow POST
	if (event.httpMethod !== "POST") {
		return {
			statusCode: 405,
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				error: "Method not allowed",
				allowedMethods: ["POST"],
			}),
		};
	}

	try {
		const buttonId = event.path.split("/").pop();

		return {
			statusCode: 200,
			headers: {
				"Content-Type": "application/json",
				"Access-Control-Allow-Origin": "*",
			},
			body: JSON.stringify({
				success: true,
				message: `Received webhook for ${buttonId}`,
				timestamp: new Date().toISOString(),
			}),
		};
	} catch (error) {
		console.error("Error:", error);
		return {
			statusCode: 500,
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ error: "Internal server error" }),
		};
	}
};
