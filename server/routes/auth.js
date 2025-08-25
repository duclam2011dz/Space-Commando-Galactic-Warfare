import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { aiLogError } from "../utils/aiLogger.js";
import logger from "../utils/logging.js";

const router = express.Router();

// helper validate
function validateRegister(username, email, password, confirmPassword) {
    const errors = [];

    if (!/^[a-z]+$/.test(username)) {
        errors.push("Username chỉ chứa chữ thường a-z, không có số/khoảng trắng.");
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
        errors.push("Email không hợp lệ.");
    }

    if (password.length < 8 || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
        errors.push("Password phải >=8 ký tự, có chữ thường và số.");
    }

    if (password !== confirmPassword) {
        errors.push("Confirm password không trùng khớp.");
    }

    return errors;
}

// REGISTER
router.post("/register", async (req, res) => {
    try {
        const { username, email, password, confirmPassword } = req.body;
        const uname = (username || "").trim().toLowerCase();
        const mail = (email || "").trim().toLowerCase();

        const errors = validateRegister(uname, mail, password, confirmPassword);
        if (errors.length > 0) {
            return res.status(400).json({ error: errors.join(" ") });
        }

        const existingUser = await User.findOne({ username: uname });
        if (existingUser) return res.status(400).json({ error: "Username đã tồn tại." });

        const existingEmail = await User.findOne({ email: mail });
        if (existingEmail) return res.status(400).json({ error: "Email đã tồn tại." });

        const hashed = await bcrypt.hash(password, 10);
        const user = new User({ username: uname, email: mail, password: hashed });
        await user.save();

        res.json({ message: "User registered successfully" });
    } catch (err) {
        logger.error("Auth Register failed: " + err.message);
        await aiLogError(err);
        console.error(err.stack);
        res.status(500).json({ error: "Server error" });
    }
});

// LOGIN
router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        const uname = (username || "").trim().toLowerCase();

        const user = await User.findOne({ username: uname });
        if (!user) return res.status(400).json({ error: "Invalid credentials" });

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(400).json({ error: "Invalid credentials" });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });

        res.json({
            token,
            user: { username: user.username, email: user.email, settings: user.settings },
        });
    } catch (err) {
        logger.error(`Auth Login failed: ${err.message}`);
        await aiLogError(err);
        console.error(err.stack);
        res.status(500).json({ error: "Server error" });
    }
});

export default router;