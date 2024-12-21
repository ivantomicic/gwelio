export default async function handler(req, res) {
	if (req.method === "POST") {
		const body = req.body;

		console.log("Webhook hit!", body);

		// Respond with a success message
		return res.status(200).json({ message: "Webhook received!" });
	} else {
		// Handle non-POST requests
		res.setHeader("Allow", ["POST"]);
		res.status(405).end(`Method ${req.method} Not Allowed`);
	}
}
