import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    timeout: 15000,
});
async function main() {
    console.log("Calling OpenAI...");
    const res = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: "say hi" }],
    });
    console.log("Response:", res.choices[0].message.content);
}
main().catch((err) => console.error("ERROR:", err));
//# sourceMappingURL=tests.js.map