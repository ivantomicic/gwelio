import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Webhook endpoint
app.post("/api/webhook/:buttonId", async (req, res) => {
	try {
		const { buttonId } = req.params;

		// Validate buttonId format
		if (!buttonId.match(/^button\d+scoreup$/)) {
			return res.status(400).json({ error: "Invalid button ID format" });
		}

		const scoreIncrease = 1;

		// Log the incoming webhook for debugging
		console.log(`Webhook received for ${buttonId}:`, {
			body: req.body,
			scoreIncrease,
		});

		return res.json({
			success: true,
			message: `Score increased for ${buttonId}`,
			scoreIncrease,
		});
	} catch (error) {
		console.error("Error processing webhook:", error);
		return res
			.status(500)
			.json({ error: "Failed to process score update" });
	}
});

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
