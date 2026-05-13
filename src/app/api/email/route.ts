import { NextResponse } from "next/server";
import { Resend } from "resend";

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy_key");

export async function POST(req: Request) {
  try {
    const { email, reportUrl, totalMonthlySavings, totalYearlySavings, aiSummary } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    if (!process.env.RESEND_API_KEY) {
      console.warn("RESEND_API_KEY missing, skipping actual email send.");
      return NextResponse.json({ success: true, dummy: true });
    }

    const { data, error } = await resend.emails.send({
      from: "Credex AI <hello@updates.credex.ai>", // Needs verified domain, but let's use a standard format
      to: email,
      subject: "Your AI Spend Audit Report",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Your AI Spend Audit Report is Ready</h2>
          <p>Thanks for using Credex AI's Spend Audit. Here is a summary of your potential savings:</p>
          <ul>
            <li><strong>Monthly Savings:</strong> $${totalMonthlySavings}</li>
            <li><strong>Annual Savings:</strong> $${totalYearlySavings}</li>
          </ul>
          <h3>AI Summary</h3>
          <p>${aiSummary || "Based on your stack, you have several opportunities to optimize your spend."}</p>
          <div style="margin: 30px 0;">
            <a href="${reportUrl}" style="background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              View Full Report
            </a>
          </div>
          <p>Best,<br/>The Credex Team</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error("Email API error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
