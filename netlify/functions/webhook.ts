import { Handler } from "@netlify/functions";

export const handler: Handler = async (event) => {
	console.log("Incoming request:", {
		path: event.path,
		method: event.httpMethod,
	});

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
