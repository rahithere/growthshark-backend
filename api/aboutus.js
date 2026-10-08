// aboutus.js
import dotenv from "dotenv";

// submission service for, mongodb
import { saveFormSubmission } from "../services/formSubmission.js";

import { ApiResponse } from "../utils/apiResponse.js";

// Load environment variables
dotenv.config();

// Email transporter configuration
// const transporter = nodemailer.createTransport({
//   host: "smtp.gmail.com",
//   port: 465,
//   secure: true,
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

export default async function handler(req, res) {
  // ✅ CORS headers
  res.setHeader(
    "Access-Control-Allow-Origin",
    process.env.FRONTEND_URL || "https://growth-shark-9wit.vercel.app"
  );
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // ✅ Handle preflight request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { name, email, contact, website, service, requirement, revenue, mode } = req.body;

  // ✅ Validation
  if (!name || !email || !contact || !website || !service || !requirement || !revenue) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }
  const saved = await saveFormSubmission({
    fullName: name,
    email,
    phone: contact,
    website,
    service,
    message: requirement,
    source: "home-form-1",
    mode: mode || "N/A"
  }, "Home-Form 1")

  if (!saved) {
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Failed to save submission"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Form submitted succesfully"))

}
