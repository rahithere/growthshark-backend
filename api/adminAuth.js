import { Admin } from "../models/admin.models.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


// REGISTER
const registerAdmin = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
        return res
            .status(400)
            .json(new ApiResponse(400, null, "All fields are required"));
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });

    if (existingAdmin) {
        return res
            .status(409)
            .json(new ApiResponse(409, null, "Admin already exists"));
    }

    // Create admin
    const admin = await Admin.create({
        name,
        email,
        password,
    });

    return res
        .status(201)
        .json(new ApiResponse(201, null, "Admin registered successfully"));
});


// LOGIN
const loginAdmin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
        return res
            .status(400)
            .json(new ApiResponse(400, null, "Email and password are required"));
    }

    // Find admin
    const admin = await Admin.findOne({ email });

    if (!admin) {
        return res
            .status(401)
            .json(new ApiResponse(401, null, "Invalid email or password"));
    }

    // Check password
    const isPasswordCorrect = await admin.isPasswordCorrect(password);

    if (!isPasswordCorrect) {
        return res
            .status(401)
            .json(new ApiResponse(401, null, "Invalid email or password"));
    }

    // Generate tokens
    const accessToken = admin.generateAccessToken();
    const refreshToken = admin.generateRefreshToken();

    // Save refresh token
    admin.refreshToken = refreshToken;
    await admin.save({ validateBeforeSave: false });

    // Store tokens in cookies
    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
    });

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
    });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    admin: {
                        id: admin._id,
                        name: admin.name,
                        email: admin.email,
                    },
                },
                "Admin logged in successfully"
            )
        );
});

// LOGOUT
const logoutAdmin = asyncHandler(async (req, res) => {
    // req.admin will come from authentication middleware
    await Admin.findByIdAndUpdate(
        req.admin._id,
        {
            $unset: {
                refreshToken: 1,
            },
        },
        {
            new: true,
        }
    );

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Admin logged out successfully"));
});


// CHANGE PASSWORD
const changeAdminPassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res
            .status(400)
            .json(
                new ApiResponse(
                    400,
                    null,
                    "Current password and new password are required"
                )
            );
    }

    // req.admin through verifyJwt middleware 
    const admin = await Admin.findById(req.admin._id);

    if (!admin) {
        return res
            .status(404)
            .json(new ApiResponse(404, null, "Admin not found"));
    }

    // Check current password
    const isPasswordCorrect =
        await admin.isPasswordCorrect(currentPassword);

    if (!isPasswordCorrect) {
        return res
            .status(401)
            .json(new ApiResponse(401, null, "Current password is incorrect"));
    }

    // Set new password
    admin.password = newPassword;

    // pre-save middleware will automatically hash it
    await admin.save();

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Password changed successfully"));
});

export {
    registerAdmin,
    loginAdmin,
    logoutAdmin,
    changeAdminPassword,
};