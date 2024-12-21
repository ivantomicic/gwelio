export const handler = async (event) => {
	// Parse incoming data (if needed)
	const body = JSON.parse(event.body || "{}");

	// Log the data for debugging
	console.log("Webhook hit!", body);

	// Respond with a success message
	return {
		statusCode: 200,
		body: JSON.stringify({ message: "Webhook received!" }),
	};
};
