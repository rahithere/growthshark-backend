import express from "express"
import router from "./adminAuthRoutes"
import multer from "multer";
import mongoose from "mongoose";
import { Blog } from "../models/blog.models.js";
import verifyJWT from "../middleware/verifyAuth";
import cloudinary from "../utils/cloudinary.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import apiError from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse";
import { Readable } from "node:stream";

dotenv.config()

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, //5mb
    }
}).single(featuredImage)

//upload to cloudinary
import { Readable } from "node:stream";

const uploadToCloudinary = (fileBuffer) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: "growthshark/blogs",
                resource_type: "image",
            },
            (error, result) => {
                if (error) {
                    return reject(error);
                }

                resolve(result);
            }
        );

        Readable.from(fileBuffer).pipe(stream);
    });
};


//delete from cloudinary
const deleteFromCloudinary = async (publicId) => {
    if (!publicId) return

    await cloudinary.uploader.destroy(publicId, {
        resource_type: "image"
    })
}


const getBlogs = asyncHandler(async (req, res) => {
    const blogs = await Blog.find({ status: "published" }).select("-content").sort({ published: -1, createdAt: -1 })
    // blogs here is an []

    return res.status(200).json(new ApiResponse(200, blogs, "Blogs fetched"))

})

const getBlogsBySlug = asyncHandler(async (req, res) => {
    const blog = await Blog.findOne({
        slug: req.params.slug,
        status: "published"
    })

    if (!blog) return res.status(404).json(new apiError(404, "No blog found"))

    return res.status(200).json(new ApiResponse(200, blog, "Blog fetched"))
})

const getAllBlogsForAdmin = asyncHandler(async (req, res) => {
    const blogs = await Blog.find().sort({ updatedAt: -1 })
    // returns an []

    return res.status(200).json(new ApiResponse(200, blogs, "Blogs fetched successfully"))
})

const createblog = asyncHandler(async (req, res) => {
    let uploadImage = ;

    const { title, slug, excerpt, content, status = "draft" } = req.body

    //validation
    if (
        !title?.trim() ||
        !slug?.trim() ||
        !excerpt?.trim() ||
        !content?.trim() ||
        !req.file
    ) {
        return res.status(400).json(new apiError(400, "All fields are required"))
    }

    //check for status
    if (!["draft", "published"].includes(status)) {
        return res.status(400).json(new apiError(400, "Invalid blog status"))
    }

    const normalizedSlug = slug
        .trim()
        .toLowercase()
        .replace(/\s+/g, "-")


    //check if slug exist
    const existingBlog = await Blog.findOne({ slug: normalizedSlug })

    if (existingBlog) {
        return res.status(409).json(new apiError(409, "A blog with this slug already exist"))
    }

    //upload image here and also check if it fails
    uploadImage = await uploadToCloudinary(req.file)

    const blog = await Blog.create({
        title: title.trim(),
        slug: normalizedSlug,
        excerpt: excerpt.trim(),
        content,
        featuredImage: uploadImage,
        status,
        publishedAt: status === "publised" ? new Date() : null
    })

    return res.status(200).json(new ApiResponse(200, blog, "Blog created sucessfully"))
})

const deleteBlog = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json(new apiError(400, "Invalid blog ID"))
    }

    const blog = await Blog.findById(id)

    if (!blog) {
        return res.status(404).json(new apiError(404, "Blog not found"))
    }

    await Blog.findByIdAndDelete(id)

    //delete the image from cloudinary too
    if (blog.featuredImage?.publicId) {
        try {
            await deleteFromCloudinary(blog.featuredImage.publicId);
        } catch (imageError) {
            console.error("Cloudinary deletin error: ", imageError)
        }
    }

    return res.status(200).json(new ApiResponse(200, null, "Blog deleted successfully"))
})