import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Movie } from "../types";

const genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });

const movieSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    recommendations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "The exact title of the movie." },
          year: { type: Type.INTEGER, description: "The release year." },
          genre: { type: Type.STRING, description: "Main genre of the movie." },
          reason: { type: Type.STRING, description: "A short, engaging explanation of why this movie fits the specific mood. Keep it under 2 sentences." },
        },
        required: ["title", "year", "genre", "reason"],
      },
    },
  },
};

export const getMovieRecommendations = async (mood: string): Promise<Movie[]> => {
  try {
    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Suggest 3 movies for a user who describes their current mood as: "${mood}". 
      Focus on a diverse selection (mix of classics and modern). 
      Ensure the tone matches the mood perfectly.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: movieSchema,
        temperature: 0.7,
      },
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No response from AI");

    const parsed = JSON.parse(jsonText);
    const recommendations = parsed.recommendations || [];

    // Map to our internal structure and add pseudo-IDs
    return recommendations.map((rec: any, index: number) => ({
      id: `${rec.title}-${rec.year}-${index}`.replace(/\s+/g, '-').toLowerCase(),
      title: rec.title,
      year: rec.year,
      reason: rec.reason,
      genre: rec.genre,
    }));

  } catch (error) {
    console.error("Gemini API Error:", error);
    // Fallback in case of API failure to keep app usable for demo
    return [
      {
        id: 'error-fallback-1',
        title: "The Secret Life of Walter Mitty",
        year: 2013,
        genre: "Adventure/Drama",
        reason: "Ideally we would have live results, but this is a great fallback for almost any mood involving seeking purpose.",
      },
      {
        id: 'error-fallback-2',
        title: "Paddington 2",
        year: 2017,
        genre: "Family/Comedy",
        reason: "If things failed, this movie is the digital equivalent of a warm hug to make you feel better.",
      },
      {
        id: 'error-fallback-3',
        title: "Arrival",
        year: 2016,
        genre: "Sci-Fi",
        reason: "A masterpiece about communication and understanding, fitting for technical difficulties.",
      }
    ];
  }
};