// server/utils/aiLogger.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import chalk from "chalk";

// Lấy API key từ .env
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Nếu có key thì tạo model, không thì để null
let model = null;
if (GEMINI_API_KEY) {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: "gemini-pro" });
}

/**
 * Log lỗi runtime với stack trace + tóm tắt từ Gemini (nếu có API key)
 * @param {Error} error 
 */
export async function aiLogError(error) {
    console.error(chalk.red("🔥 Runtime Error:"), error.stack || error);

    if (model) {
        try {
            const prompt = `Hãy tóm tắt lỗi ngắn gọn, chỉ 1 dòng súc tích: ${error.stack}`;
            const result = await model.generateContent(prompt);

            console.log(chalk.magenta("🤖 AI Summary:"), result.response.text());
        } catch (aiErr) {
            console.warn(chalk.yellow("⚠️ Gemini AI log failed:"), aiErr.message);
        }
    } else {
        console.log(chalk.gray("ℹ️ Gemini disabled (no API key in .env)"));
    }
}