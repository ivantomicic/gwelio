export default async function handler(req, res) {
	const { webhookName } = req.query;

	if (req.method === "POST") {
		console.log(`Webhook hit! Name: ${webhookName}`);
		console.log("Payload:", req.body);

		// Process each webhook based on the name
		switch (webhookName) {
			case "button1scoreup":
				// Logic for button1scoreup
				console.log("Button 1 Score Up logic executed");
				break;
			case "button2scoreup":
				// Logic for button2scoreup
				console.log("Button 2 Score Up logic executed");
				break;
			case "button3scoreup":
				// Logic for button3scoreup
				console.log("Button 3 Score Up logic executed");
				break;
			case "button4scoreup":
				// Logic for button4scoreup
				console.log("Button 4 Score Up logic executed");
				break;
			case "button5scoreup":
				// Logic for button5scoreup
				console.log("Button 5 Score Up logic executed");
				break;
			case "button6scoreup":
				// Logic for button6scoreup
				console.log("Button 6 Score Up logic executed");
				break;
			default:
				console.log("Unknown webhook name");
				return res.status(404).json({ message: "Webhook not found" });
		}

		return res
			.status(200)
			.json({ message: `Webhook ${webhookName} received!` });
	} else {
		res.setHeader("Allow", ["POST"]);
		return res.status(405).end(`Method ${req.method} Not Allowed`);
	}
}
