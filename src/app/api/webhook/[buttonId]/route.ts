import { NextResponse } from "next/server";

export async function POST(
	request: Request,
	{ params }: { params: { buttonId: string } }
) {
	try {
		const { buttonId } = params;

		// Log the incoming webhook for debugging
		console.log("Webhook received:", buttonId);

		// You can add score tracking logic here if needed
		// For now, just acknowledge the score increase
		return NextResponse.json({
			success: true,
			message: `Score button ${buttonId} pressed`,
		});
	} catch (error) {
		console.error("Error processing webhook:", error);
		return NextResponse.json(
			{ error: "Failed to process score update" },
			{ status: 500 }
		);
	}
}
