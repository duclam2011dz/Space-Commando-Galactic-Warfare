import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import readline from "readline";
import chalk from "chalk";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import logger from "./utils/logging.js";
import { connectDB } from "./database.js";
import authRoutes from "./routes/auth.js";
import GameServer from "./classes/GameServer.js";

dotenv.config();
connectDB();

// CLI input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

let menuActive = false;
let selectedIndex = 0;

function renderMenu() {
    console.clear();
    console.log("=== LOGGING MENU === (↑/↓ để chọn, Enter để toggle, q để thoát)\n");

    const config = logger.constructor.getConfig();
    const categories = Object.keys(config);

    categories.forEach((cat, i) => {
        const prefix = i === selectedIndex ? "👉" : "  ";
        const status = config[cat] ? chalk.green("ON") : chalk.red("OFF");
        console.log(`${prefix} ${cat.toUpperCase()} : ${status}`);
    });
}

process.stdin.on("keypress", (str, key) => {
    if (!menuActive) return;

    const config = logger.constructor.getConfig();
    const categories = Object.keys(config);

    if (key.name === "up") {
        selectedIndex = (selectedIndex - 1 + categories.length) % categories.length;
        renderMenu();
    } else if (key.name === "down") {
        selectedIndex = (selectedIndex + 1) % categories.length;
        renderMenu();
    } else if (key.name === "return") {
        const cat = categories[selectedIndex];
        const newVal = logger.constructor.toggle(cat);
        console.log(`Toggled ${cat.toUpperCase()} → ${newVal ? "ON" : "OFF"}`);
        renderMenu();
    } else if (key.name === "q" || key.name === "escape") {
        menuActive = false;
        console.clear();
        console.log("Exited logging menu.");
    }
});

rl.on("line", (input) => {
    if (input.trim() === "logs on") {
        logger.constructor.setAll(true);
        console.log("✅ All logs enabled");
    } else if (input.trim() === "logs off") {
        logger.constructor.setAll(false);
        console.log("🚫 All logs disabled");
    } else if (input.trim() === "logs") {
        menuActive = true;
        renderMenu();
    }
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);

// middlewares
app.use(bodyParser.json());

// routes
app.use("/api/auth", authRoutes);

// default route
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/auth.html"));
});

// static cuối cùng
app.use(express.static(path.join(__dirname, "../public")));

// init game server
new GameServer(httpServer);

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
    logger.info(`🚀 Server running at http://localhost:${PORT}`);
});