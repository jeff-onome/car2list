
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

export class AIService {
  async getCarAdvice(query: string, inventorySummary: string) {
    try {
      // Ensure the API key exists before attempting initialization
      if (!process.env.API_KEY) {
        return "I apologize, but my communication systems are currently offline. Please try again later.";
      }

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `You are the AutoSphere Car Concierge. Help the user with their car search.
        Inventory Context: ${inventorySummary}
        User Query: ${query}`,
        config: {
          systemInstruction: "You are a sophisticated, helpful automotive consultant for high-net-worth individuals. Keep responses elegant, factual, and persuasive about our inventory. If you don't have enough data, suggest they contact our human concierge.",
          temperature: 0.7
        }
      });

      if (!response || !response.text) {
        throw new Error("Empty response received from the concierge service.");
      }

      return response.text;
    } catch (error: any) {
      // Gracefully handle "signal aborted" errors which occur during network interruptions or safety blocks
      if (error.name === 'AbortError' || error.message?.toLowerCase().includes('aborted')) {
        console.warn("AI Request was aborted by the environment.");
        return "The connection was momentarily interrupted. Could you please repeat your request?";
      }
      
      console.error("AI Service Error:", error);
      return "I apologize, but I am having trouble connecting to my database. How else can I assist you with our luxury collection today?";
    }
  }
}

export const aiService = new AIService();
