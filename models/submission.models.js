import mongoose, { Schema } from "mongoose";

//Schema for submission data
const submissionSchema = new Schema(
    {
        fullName: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true
        },
        phone: {
            type: String,
            defualt: null
        },
        website: {
            type: String,
            default: null
        },
        service: {
            type: String,
            default: null,  // recheck default value in frontend
        },
        message: {
            type: String,
            default: null
        },
        source: {
            type: String,
            enum: [
                "home-form-1",
                "home-form-2",
                "career",
                "contact",
                "lawyers",
                "roofers",
                "plumbers",
                "dental"
            ],
            required: true
        },
        mode: {
            type: String,
            enum: ["attack", "stealth", "N/A"],
            default: "N/A"
        }
    }
    , { timestamps: true })


export const Submission = mongoose.model("Submission", submissionSchema)