import nodemailer from "nodemailer";
import dotenv from "dotenv";

//import submission service for this route
import { saveFormSubmission } from "../services/formSubmission.js";
import { ApiResponse } from "../utils/apiResponse.js";

// Load environment variables from a .env file
dotenv.config();


// The API handler function for Express.js
export default async function partnersubmit(req, res) {

    // Destructure the answers and eligibility from the request body
    const { answers, eligibility, mode } = req.body;

    // Ensure we have the necessary data
    if (!answers || !answers.name || !answers.email) {
        return res.status(400).json({ message: "Missing required form data" });
    }

    //update the data to mongodb
    const saved = await saveFormSubmission({
        fullName: answers.name,
        email: answers.email,
        phone: "N/A",
        website: "N/A",
        service: "N/A",
        message: ` Business age: ${answers.age}\n Monthly Revenue: ${answers.revenue}\n Team size: ${answers.team}\n Time Availability: ${answers.time} `,
        source: "home-form-2",
        mode: mode || "N/A"
    }, "Home-form 2 quiz")


    if (!saved) {
        return res
            .status(500)
            .json(new ApiResponse(500, null, "Failed to save submission"));
    }

    res
        .status(200)
        .json(new ApiResponse(200, null, "Form saved successfully"))
}
