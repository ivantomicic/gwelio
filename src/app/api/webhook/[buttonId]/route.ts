import { NextResponse } from "next/server";

export async function POST(
	request: Request,
	{ params }: { params: { buttonId: string } }
) {
	try {
		const { buttonId } = params;

		// Map button IDs to score values if needed
		const scoreIncrease = 1; // Or whatever score value you want to use

		// Log the incoming webhook for debugging
		console.log(
			`Webhook received for ${buttonId}, increasing score by ${scoreIncrease}`
		);

		return NextResponse.json({
			success: true,
			message: `Score increased for ${buttonId}`,
			scoreIncrease,
		});
	} catch (error) {
		console.error("Error processing webhook:", error);
		return NextResponse.json(
			{ error: "Failed to process score update" },
			{ status: 500 }
		);
	}
}
