const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Student = require("../models/Student");
const Professor = require("../models/Professor");
const Admin = require("../models/Admin");

const router = express.Router();

// Register User
router.post("/register", async (req, res) => {
    console.log(req.body);
    const role = req.body.role;
    const type = role.toLowerCase();

    const identifier = type === "student" ? req.body.rollNo : type === "professor" ? req.body.profId : req.body.adminUsername;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;

    if (password !== confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match" });
    }

    let Model;
    if (type === "student") Model = Student;
    else if (type === "professor") Model = Professor;
    else if (type === "admin") Model = Admin;
    else return res.status(400).json({ message: "Invalid user type" });

    try {
        let existingUser;
        if (type === "student") { existingUser = await Student.findOne({ rollNo: identifier });}
        else if (type === "professor") { existingUser = await Professor.findOne({ profId: identifier });}
        else if (type === "admin") {existingUser = await Admin.findOne({ adminUsername: identifier });}
        
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new Model({
            [type === "student" ? "rollNo" : type === "professor" ? "profId" : "username"]: identifier,
            password: hashedPassword
        });

        await newUser.save();
        res.status(201).json({ message: "User registered successfully" });

    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
});

// Login User
router.post("/login", async (req, res) => {
    const type = req.body.role.toLowerCase();
    const password = req.body.password;
    const identifier = type === "student" ? req.body.rollNo : type === "professor" ? req.body.profId : req.body.adminUsername;

    console.log(req.body);
    
    let Model;
    if (type === "student") Model = Student;
    else if (type === "professor") Model = Professor;
    else if (type === "admin") Model = Admin;
    else return res.status(400).json({ message: "Invalid user type" });

    try {
        const user = await Model.findOne({ [type === "student" ? "rollNo" : type === "professor" ? "profId" : "username"]: identifier });

        if (!user) return res.status(400).json({ message: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);  
        console.log(isMatch);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign({ id: user._id, type }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.json({ message: "Login successful", token });

    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;
