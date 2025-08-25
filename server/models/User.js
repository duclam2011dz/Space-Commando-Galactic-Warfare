import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, lowercase: true, match: /^[a-z]+$/ },
    email: { type: String, required: true, unique: true, lowercase: true, match: /^\S+@\S+\.\S+$/ },
    password: { type: String, required: true },
    settings: {
        skin: { type: String, default: "blue" },
        showGrid: { type: Boolean, default: true },
    },
});

export default mongoose.model("User", userSchema);