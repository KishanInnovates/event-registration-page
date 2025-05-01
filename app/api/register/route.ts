import { NextResponse } from "next/server"
import { submitRegistration } from "@/lib/sheets" // adjust the path as needed

export async function POST(request: Request) {
  try {
    const data = await request.json()

    console.log("Registration data received:", data)

    const result = await submitRegistration(data)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in registration API:", error)
    return NextResponse.json({ error: "Failed to process registration" }, { status: 500 })
  }
}
