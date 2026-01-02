
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { NewsArticle, GroundingSource } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const fetchNews = async (query: string): Promise<{ articles: NewsArticle[], sources: GroundingSource[] }> => {
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Search for the latest news regarding: "${query}". 
      Return exactly 6 diverse news items. 
      For each item, strictly follow this format:
      ---
      TITLE: [Title of the story]
      SUMMARY: [A concise 2-3 sentence summary]
      URL: [The most direct URL you can find]
      SOURCE: [Name of the news outlet]
      DATE: [Recent date/time]
      ---`,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 1,
      },
    });

    const text = response.text || "";
    const articles: NewsArticle[] = [];
    
    // Simple parsing logic for the requested format
    const blocks = text.split('---').filter(b => b.trim().length > 50);
    
    blocks.forEach((block, index) => {
      const title = block.match(/TITLE:\s*(.*)/)?.[1]?.trim();
      const summary = block.match(/SUMMARY:\s*(.*)/)?.[1]?.trim();
      const url = block.match(/URL:\s*(.*)/)?.[1]?.trim();
      const source = block.match(/SOURCE:\s*(.*)/)?.[1]?.trim();
      const date = block.match(/DATE:\s*(.*)/)?.[1]?.trim();

      if (title && summary) {
        articles.push({
          id: `article-${index}-${Date.now()}`,
          title,
          summary,
          url: url || "#",
          source: source || "Unknown Source",
          date: date || "Recently",
          category: "General",
          imageUrl: `https://picsum.photos/seed/${encodeURIComponent(title)}/800/450`
        });
      }
    });

    // Extract grounding sources
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources: GroundingSource[] = groundingChunks
      .filter(chunk => chunk.web)
      .map(chunk => ({
        title: chunk.web?.title || "Reference Source",
        uri: chunk.web?.uri || ""
      }));

    return { articles, sources };
  } catch (error) {
    console.error("Gemini News Fetch Error:", error);
    throw error;
  }
};
