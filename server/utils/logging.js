import chalk from "chalk";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ENV_PATH = path.join(__dirname, "../.env");

const logConfig = {
    info: process.env.LOG_INFO === "true",
    success: process.env.LOG_SUCCESS === "true",
    warn: process.env.LOG_WARN === "true",
    error: process.env.LOG_ERROR === "true",
    socket: process.env.LOG_SOCKET === "true",
    ping: process.env.LOG_PING === "true",
};

let ENABLE_LOGS = process.env.ENABLE_LOGS === "true";

class Logger {
    _log(type, colorFn, message, category) {
        if (!ENABLE_LOGS) return;
        if (!logConfig[category]) return;
        console.log(colorFn(type), message);
    }

    info(message) {
        this._log("[INFO]", chalk.blue, message, "info");
    }

    success(message) {
        this._log("[SUCCESS]", chalk.green, message, "success");
    }

    warn(message) {
        this._log("[WARN]", chalk.yellow, message, "warn");
    }

    error(message) {
        this._log("[ERROR]", chalk.red, message, "error");
    }

    socket(message, socketId) {
        if (!ENABLE_LOGS || !logConfig.socket) return;
        console.log(chalk.magenta(`[SOCKET:${socketId}]`), message);
    }

    ping(message) {
        this._log("[PING]", chalk.cyan, message, "ping");
    }

    // expose config cho menu chỉnh
    static getConfig() {
        return { ENABLE_LOGS, ...logConfig };
    }

    static toggle(category) {
        logConfig[category] = !logConfig[category];
        Logger.saveEnv();
        return logConfig[category];
    }

    static saveEnv() {
        let envContent = fs.readFileSync(ENV_PATH, "utf-8").split("\n");

        function setEnvVar(key, val) {
            const idx = envContent.findIndex((line) => line.startsWith(`${key}=`));
            if (idx >= 0) envContent[idx] = `${key}=${val}`;
            else envContent.push(`${key}=${val}`);
        }

        setEnvVar("ENABLE_LOGS", ENABLE_LOGS);

        for (const key of Object.keys(logConfig)) {
            setEnvVar(`LOG_${key.toUpperCase()}`, logConfig[key]);
        }

        fs.writeFileSync(ENV_PATH, envContent.join("\n"), "utf-8");
    }

    static setAll(value) {
        Object.keys(logConfig).forEach((k) => (logConfig[k] = value));
        ENABLE_LOGS = value;
        Logger.saveEnv();
    }
}

export default new Logger();