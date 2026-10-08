// backend/api/contact.js

import dotenv from "dotenv";
import { saveFormSubmission } from "../services/formSubmission.js";
import { ApiResponse } from "../utils/apiResponse.js";

// Load environment variables
dotenv.config();


// API route
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { name, email, message } = req.body;

  // Validate input
  if (!name || !email || !message) {
    return res.status(400).json({ message: "All fields are required" });
  }

  //save data to mongodb
  const saved = await saveFormSubmission({
    fullName: name,
    email,
    message,
    phone: "N/A",
    website: "N/A",
    service: "N/A",
    source: "contact",
    mode: "N/A"
  }, "Contact-section form")

  if (!saved) {
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Failed to save the data"))
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Data saved successfully"))


}
