import express from "express";
const app = express();
const port = 3000;

app.use(express.json());

app.post("/webhook", (req, res) => {
	console.log("Webhook hit!", req.body);
	res.status(200).send("Webhook received!");
});

app.listen(port, () => {
	console.log(`Server running at http://localhost:${port}`);
});
