import { GoogleGenAI } from "@google/genai";

// Initialize the client strictly according to guidelines
const apiKey = process.env.API_KEY || ''; // In a real app, ensure this is set
const ai = new GoogleGenAI({ apiKey });

/**
 * Placeholder for future AI features (e.g., generating product descriptions, 
 * analyzing user trends, or assisting admins).
 */
export const generateAdminAdvice = async (context: string) => {
  if (!apiKey) {
    console.warn("Gemini API Key is missing");
    return "AI services unavailable.";
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are an admin assistant for an electronics store. Provide brief advice based on this context: ${context}`,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error generating advice.";
  }
};