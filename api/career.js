import multer from "multer";
import cloudinary from "../utils/cloudinary.js";
import dotenv from "dotenv";
import { saveFormSubmission } from "../services/formSubmission.js";
import { ApiResponse } from "../utils/apiResponse.js";
import connectDB from "../db/index.js";

// Load environment variables
dotenv.config();

// Set up multer to handle file uploads in memory
const upload = multer({
  storage: multer.memoryStorage(),
}).single("resume");

// API route handler
export default async function handler(req, res) {
  // CORS headers
  res.setHeader(
    "Access-Control-Allow-Origin",
    process.env.FRONTEND_URL || "https://growth-shark-9wit.vercel.app"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  // Handle file upload
  upload(req, res, async (err) => {
    if (err) {
      return res.status(500).json({
        message: "Error during file upload",
        error: err.message,
      });
    }

    try {
      const { name, email, countryCode, whatsapp } = req.body;

      // Validation
      if (!name || !email || !countryCode || !whatsapp || !req.file) {
        return res.status(400).json({
          message: "All fields are required",
        });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(email)) {
        return res.status(400).json({
          message: "Invalid email format",
        });
      }

      // Upload resume directly to Cloudinary from memory
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "growthshark/resumes",
            resource_type: "raw",
            public_id: `${Date.now()}-${req.file.originalname.replace(/\.pdf$/i, "")}.pdf`,
          },
          (error, result) => {
            if (error) {
              return reject(error);
            }

            resolve(result);
          }
        );

        stream.end(req.file.buffer);
      });

      const resumeUrl = result.secure_url;


      await connectDB()
      // Save submission using existing logic
      const saved = await saveFormSubmission(
        {
          fullName: name,
          email,
          phone: `${countryCode} ${whatsapp} `,
          website: "N/A",
          service: "N/A",
          message: `resume: ${resumeUrl} `,
          source: "career",
          mode: "N/A",
        },
        "Career-section form"
      );

      if (!saved) {
        return res
          .status(500)
          .json(
            new ApiResponse(500, null, "Failed to save form data")
          );
      }

      return res
        .status(200)
        .json(new ApiResponse(200, null, "Form data saved"));
    } catch (error) {
      console.error("Career submission error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to submit application",
      });
    }
  });
}
