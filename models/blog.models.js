import mongoose, { Schema } from "mongoose"

const blogSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    excerpt: {
        type: String,
        required: true,
        trim: true,
    },
    content: {
        type: String,
        required: true,
    },
    featuredImage: {
        url: {
            type: String,
            required: true,
        },
        publicId: {
            type: String,
            required: true,
        }
    },
    status: {
        type: String,
        enum: ["draft", "published"],
        default: "draft"
    }
}, { timestamps: true })

export const Blog = mongoose.model("Blog", blogSchema)