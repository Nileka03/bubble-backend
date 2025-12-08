import { GoogleGenerativeAI } from "@google/generative-ai";
import Message from "../models/message.js";
import dotenv from "dotenv";
dotenv.config();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const FALLBACK_SUGGESTIONS = ["Tell me more", "I'm not sure", "Let's talk later"];

export const getSmartReplies = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    console.log("\n--- AI REQUEST START (GEMINI) ---");

    // 1. Fetch Context
    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(5);

    if (!messages.length) return res.status(200).json({ suggestions: [] });

    // 2. Format Context
    const conversationText = messages.reverse().map(m => {
      const role = m.senderId.toString() === myId.toString() ? "Me" : "Partner";
      return `${role}: ${m.text}`;
    }).join("\n");

    const lastMessage = messages[messages.length - 1];
    console.log("Context:\n", conversationText);

    // --- SAFETY CHECK (Disable if testing with self-messages) ---
    // if (lastMessage.senderId.toString() === myId.toString()) {
    //    return res.status(200).json({ suggestions: [] });
    // }

    // 3. Prompt for Gemini
    const prompt = `
      You are a smart reply assistant.
      Read the following chat history between "Me" and "Partner".
      Generate 3 short, concise, and context-aware replies for "Me" to send next.
      
      Chat History:
      ${conversationText}

      Output strict JSON format ONLY:
      ["Reply 1", "Reply 2", "Reply 3"]
    `;

    // 4. Call Gemini API
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();

      console.log("Raw Gemini Output:", text);

      // 5. Clean & Parse
      // Remove markdown code blocks (Gemini loves adding ```json)
      text = text.replace(/```json/g, "").replace(/```/g, "").trim();
      
      let suggestions = [];
      try {
        suggestions = JSON.parse(text);
      } catch (e) {
        console.error("JSON Parsing failed");
      }

      // Filter empty/long strings
      suggestions = suggestions.filter(s => typeof s === 'string' && s.length > 0 && s.length < 60);
      
      if (suggestions.length === 0) suggestions = FALLBACK_SUGGESTIONS;

      console.log("Sending:", suggestions);
      res.status(200).json({ suggestions });

    } catch (apiError) {
      console.error("Gemini API Failed:", apiError.message);
      res.status(200).json({ suggestions: FALLBACK_SUGGESTIONS });
    }

  } catch (error) {
    console.error("Critical Error:", error);
    res.status(500).json({ error: "Server Error" });
  }
};