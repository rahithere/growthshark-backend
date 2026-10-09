import connectDB from "../db/index.js";
import { Submission } from "../models/submission.models.js"

const adminSubmissions = async (req, res) => {
    if (req.method !== "GET") {
        return res.status(405).json({
            success: false,
            message: "Method not allowed",
        });
    }

    try {
        await connectDB()
        const submissions = await Submission
            .find()
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            data: submissions,
        });
    } catch (error) {
        console.error("Error fetching submissions:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch submissions",
        });
    }
};

export default adminSubmissions;