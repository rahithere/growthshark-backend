import multer from 'multer';
import cloudinary from "../utils/cloudinary.js"
import fs from "fs/promises"
import dotenv from "dotenv";
import { saveFormSubmission } from '../services/formSubmission.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { log } from 'console';


// Load environment variables
dotenv.config();

// Set up multer to handle file uploads
const storage = multer.diskStorage({
  destination: "./uploads",
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`)
  }
})
const upload = multer({ storage: storage }).single('resume');

// API route handler
export default async function handler(req, res) {
  // ✅ CORS headers
  res.setHeader("Access-Control-Allow-Origin", process.env.FRONTEND_URL || "https://growth-shark-9wit.vercel.app");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // ✅ Handle preflight request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // ✅ Handle file upload
  upload(req, res, async (err) => {
    if (err) {
      return res.status(500).json({ message: 'Error during file upload', error: err.message });
    }

    const { name, email, countryCode, whatsapp } = req.body;

    // Validation

    if (!name || !email || !countryCode || !whatsapp || !req.file) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    const localFilePath = req.file.path;

    console.log("local file: ", localFilePath)
    try {
      const result = await cloudinary.uploader.upload(localFilePath, {
        folder: "growthshark/resumes",
        resource_type: "raw"
      })

      const resumeUrl = result.url

      const saved = await saveFormSubmission({
        fullName: name,
        email,
        phone: `${countryCode} ${whatsapp}`,
        website: "N/A",
        service: "N/A",
        message: `resume: ${resumeUrl}`,
        source: "career",
        mode: "N/A"
      }, "Career-section form")

      await fs.unlink(localFilePath)

      if (!saved) {
        return res
          .status(500)
          .json(new ApiResponse(500, null, "Failed to save form data"))
      }

      res
        .status(200)
        .json(new ApiResponse(200, null, "Form data saved"))

    } catch (error) {
      console.log("Career submission error: ", error)

      //clean up temp file
      try {
        await fs.unlink(localFilePath)
      } catch { error } {
        console.error("Failed to delete temporary file: ", error)
      }

      return res
        .status(500)
        .json({
          success: false,
          message: "Failed to submit application"
        })
    }
  });
}
