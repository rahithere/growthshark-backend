import { Router } from "express";

import {
    registerAdmin,
    loginAdmin,
    logoutAdmin,
    changeAdminPassword,
} from "./adminAuth.js";

import verifyJWT from "../middleware/verifyAuth.js";

const router = Router();

router.post("/register", registerAdmin);
router.post("/login", loginAdmin);
router.post("/logout", verifyJWT, logoutAdmin);
router.post("/change-password", verifyJWT, changeAdminPassword);

// to check current loggedin in frontend
router.get("/me", verifyJWT, (req, res) => {
    return res.status(200).json({
        success: true,
        data: {
            id: req.admin._id,
            name: req.admin.name,
            email: req.admin.email,
        },
    });
});

export default router;