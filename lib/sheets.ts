"use server"

import { GoogleSpreadsheet } from "google-spreadsheet"
import { JWT } from "google-auth-library"

type RegistrationData = {
  name: string
  email: string
  contact: string
  college: string
  branch: string
  year: string
}

export async function submitRegistration(data: RegistrationData) {
  try {
    console.log("Starting registration submission process...")

    // Validate environment variables
    if (!process.env.GOOGLE_SHEETS_CLIENT_EMAIL) {
      throw new Error("GOOGLE_SHEETS_CLIENT_EMAIL environment variable is missing")
    }

    if (!process.env.GOOGLE_SHEETS_PRIVATE_KEY) {
      throw new Error("GOOGLE_SHEETS_PRIVATE_KEY environment variable is missing")
    }

    if (!process.env.GOOGLE_SHEETS_SHEET_ID) {
      throw new Error("GOOGLE_SHEETS_SHEET_ID environment variable is missing")
    }

    const sheetId = process.env.GOOGLE_SHEETS_SHEET_ID
    const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, "\n")

    // Authenticate with Google
    const auth = new JWT({
      email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      key: privateKey,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    })

    // Load the spreadsheet
    const doc = new GoogleSpreadsheet(sheetId, auth)
    await doc.loadInfo()

    const sheet = doc.sheetsByIndex[0]

    // Set header row if it's empty
    const rows = await sheet.getRows()
    if (rows.length === 0) {
      await sheet.setHeaderRow(["Name", "Email", "Contact", "College", "Branch", "Year", "RegistrationDate"])
    }

    // Add new row
    await sheet.addRow({
      Name: data.name,
      Email: data.email,
      Contact: data.contact,
      College: data.college,
      Branch: data.branch,
      Year: data.year,
      RegistrationDate: new Date().toISOString(),
    })

    console.log("Registration data added to Google Sheet successfully.")
    return { success: true }
  } catch (error) {
    console.error("Error in submitRegistration:", error)
    if (error instanceof Error) {
      throw new Error(`Registration failed: ${error.message}`)
    }
    throw new Error("Registration failed due to an unknown error")
  }
}
