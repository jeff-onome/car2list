
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

export class AIService {
  // Creating a new instance right before the API call to ensure use of the most up-to-date environment variable.
  async getCarAdvice(query: string, inventorySummary: string) {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      // Fixed: Explicitly typed response as GenerateContentResponse and accessed .text property as per SDK guidelines
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `You are the AutoSphere Car Concierge. Help the user with their car search.
        Inventory Context: ${inventorySummary}
        User Query: ${query}`,
        config: {
          systemInstruction: "You are a sophisticated, helpful automotive consultant for high-net-worth individuals. Keep responses elegant, factual, and persuasive about our inventory.",
          temperature: 0.7
        }
      });
      return response.text;
    } catch (error) {
      console.error("AI Service Error:", error);
      return "I apologize, but I am having trouble connecting to my database. How else can I assist you with our luxury collection today?";
    }
  }
}

export const aiService = new AIService();
