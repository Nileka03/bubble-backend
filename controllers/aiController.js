import { GoogleGenerativeAI } from "@google/generative-ai";
import Message from "../models/message.js";
import dotenv from "dotenv";
dotenv.config();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


const model = genAI.getGenerativeModel({ model: "gemma-3-4b-it" });

const FALLBACK_SUGGESTIONS = ["Tell me more", "I'm not sure", "Let's talk later"];

export const getSmartReplies = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    console.log("\n--- AI REQUEST START (SMART REPLY) ---");

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

    console.log("Context:\n", conversationText);

    // 3. Prompt for Gemma
    const prompt = `
      You are a smart reply assistant.
      Read the following chat history between "Me" and "Partner".
      Generate 3 short, concise, and context-aware replies for "Me" to send next.
      
      Chat History:
      ${conversationText}

      Output strict JSON format ONLY:
      ["Reply 1", "Reply 2", "Reply 3"]
    `;

    // 4. Call API
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();

      // 5. Clean & Parse
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
      console.error("AI API Failed:", apiError.message);
      res.status(200).json({ suggestions: FALLBACK_SUGGESTIONS });
    }

  } catch (error) {
    console.error("Critical Error:", error);
    res.status(500).json({ error: "Server Error" });
  }
};

// analyze mood function
export const analyzeMood = async (conversationHistory) => {
  try {
    const prompt = `
      Analyze the emotional tone of the following conversation.
      
      Conversation:
      ${conversationHistory.map(msg => `${msg.sender === "me" ? "User" : "Partner"}: ${msg.text}`).join("\n")}

      Rules:
      1. Return ONLY a valid JSON object. Do not add markdown blocks.
      2. The "emotion" field must be exactly one of the following:
         "joy", "love", "grateful", "confident", "surprised", "calm", 
         "neutral", "bored", "confused", "anxious", "sad", "angry".
      3. The "intensity" field must be a number between 0.0 (low) and 1.0 (high).
      
      Example Output:
      { "emotion": "love", "intensity": 0.9 }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Clean markdown if present
    text = text.replace(/```json|```/g, "").trim();
    
    try {
        return JSON.parse(text);
    } catch (e) {
        console.error("Mood JSON parse error", e);
        // Default to neutral on parse error
        return { emotion: "neutral", intensity: 0.5 };
    }
  } catch (error) {
    console.error("Mood Analysis Error:", error.message);
    
    // Fallback default on API error
    return { emotion: "neutral", intensity: 0.5 };
  }
};