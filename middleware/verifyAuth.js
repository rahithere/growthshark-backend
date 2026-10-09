import connectDB from "../db/index.js";
import { Admin } from "../models/admin.models.js";
import jwt from 'jsonwebtoken'

const verifyJWT = async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken;
        // console.log(req.cookies)
        // console.log(token)
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized. Please login.",
            });
        }

        const decodedToken = jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET
        );

        await connectDB()
        const admin = await Admin.findById(decodedToken._id).select(
            "-password -refreshToken"
        );

        if (!admin) {
            return res.status(401).json({
                success: false,
                message: "Admin not found.",
            });
        }
        // console.log(admin._id, admin.email)

        req.admin = admin;

        next();
    } catch (error) {
        console.error("JWT verification error:", error);

        return res.status(401).json({
            success: false,
            message: "Invalid or expired access token.",
        });
    }
};

export default verifyJWT;