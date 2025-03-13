const express = require("express");
const jwt = require("jsonwebtoken");
const Student = require("../models/Student");
const Professor = require("../models/Professor");
const visitorQueue = require("../jobs/qr_mail.js");

const router = express.Router();

// Middleware to verify JWT Token
const verifyToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) return res.status(401).json({ success: false, message: "No token provided" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: "Invalid token" });
    }
};

// Handle Visitor Form Submission
router.post("/submit-visitor", verifyToken, async (req, res) => {
    try {
        const { userRole, userId, visitorType, visitors } = req.body;

        let user;
        if (userRole === "student") {
            user = await Student.findOne({ rollNo: userId });
        } else if (userRole === "professor") {
            user = await Professor.findOne({ profId: userId });
        }

        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        console.log("User Role:", userRole);
        console.log("User ID:", userId);
        console.log("Visitor Type:", visitorType);
        console.log("Visitors:", visitors);

        // Enqueue background job
        visitorQueue.add({ visitors, userRole, userId }).then((job) => {
            console.log(`Job ${job.id} added to queue`);
        }).catch(console.error);

        return res.json({ success: true, message: "Visitor entry recorded, emails will be sent shortly" });

    } catch (error) {
        console.error("Error handling visitor submission:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
});

module.exports = router;
