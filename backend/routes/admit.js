const express = require("express");
const mongoose = require("mongoose");
const Visitor = require("../models/Admit");  // Import the Mongoose model

const router = express.Router();


// Entry Route (Admit a visitor)
router.post("/entry", async (req, res) => {
    try {
        const { govID, name, phone, email, userRole, type, userId, purpose, quantity } = req.body;

        if (!govID) return res.status(400).json({ message: "govID is required" });

        let visitor = await Visitor.findOne({ govID });

        if (visitor) {
            // Check if the last visit is still open (exitTime is null)
            const lastVisit = visitor.visits[visitor.visits.length - 1];
            if (lastVisit && lastVisit.exitTime === null) {
                return res.status(400).json({ message: "Last exit not handled. Please exit before new entry." });
            }
        }

        // Create a new visit record with entry time
        const newVisit = {
            entryTime: new Date(),  // Server time
            purpose,
            quantity,
            status: "in-progress"
        };

        if (!visitor) {
            // If visitor is not found, create a new visitor record
            visitor = new Visitor({
                govID,
                name,
                phone,
                email,
                userRole,
                type,
                userId,
                visits: [newVisit] // First visit entry
            });
        } else {
            // If visitor exists, just add a new visit entry
            visitor.visits.push(newVisit);
        }

        await visitor.save();

        res.status(201).json({ message: "Entry recorded successfully", visitor });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

module.exports = router;



// Exit Route (Record visitor exit)
router.post("/exit", async (req, res) => {
    try {
        const { govID } = req.body;

        if (!govID) return res.status(400).json({ message: "govID is required" });

        let visitor = await Visitor.findOne({ govID });

        if (!visitor) {
            return res.status(404).json({ message: "Visitor not found" });
        }

        // Find the last visit with no exit time (visitor still inside)
        const lastVisit = visitor.visits.find(v => v.exitTime === null);

        if (!lastVisit) {
            return res.status(400).json({ message: "No active visit found. Please enter first." });
        }

        // Set exit time and update status
        lastVisit.exitTime = new Date(); // Server time
        lastVisit.status = "completed";

        await visitor.save();

        res.status(200).json({ message: "Exit recorded successfully"});
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

module.exports = router;
