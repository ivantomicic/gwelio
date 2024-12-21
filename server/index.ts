import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Webhook endpoint
app.post("/api/webhook/:buttonId", (req, res) => {
	const { buttonId } = req.params;

	console.log(`Webhook received for button: ${buttonId}`);

	return res.json({
		success: true,
		message: `Received webhook for ${buttonId}`,
		timestamp: new Date().toISOString(),
	});
});

app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
});
