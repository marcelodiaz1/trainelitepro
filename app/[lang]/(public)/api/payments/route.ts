import { NextResponse } from "next/server";

export async function GET() {
  try {
    const auth = Buffer.from(
      `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`
    ).toString("base64");

    // 1. Get Access Token
    const tokenRes = await fetch("https://api-m.paypal.com/v1/oauth2/token", {
      method: "POST",
      body: "grant_type=client_credentials",
      headers: { 
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
    });
    const { access_token } = await tokenRes.json();

    // 2. Fetch Transactions (Last 30 days)
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('.')[0] + "Z";
    const endDate = new Date().toISOString().split('.')[0] + "Z";

    const searchRes = await fetch(
      `https://api-m.paypal.com/v1/reporting/transactions?start_date=${startDate}&end_date=${endDate}&fields=all`,
      { headers: { Authorization: `Bearer ${access_token}` } }
    );

    const data = await searchRes.json();
    return NextResponse.json(data.transaction_details || []);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}