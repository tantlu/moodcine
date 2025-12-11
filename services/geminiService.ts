import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Movie, MovieDetails } from "../types";

const genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });

const movieSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    recommendations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "The exact official title of the movie." },
          year: { type: Type.INTEGER, description: "The release year." },
          genre: { type: Type.STRING, description: "Main genre of the movie." },
          reason: { type: Type.STRING, description: "A compelling, cinematic hook explaining exactly why this movie matches the user's mood. Max 25 words." },
        },
        required: ["title", "year", "genre", "reason"],
      },
    },
  },
};

const detailsSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    synopsis: { type: Type.STRING, description: "A captivating synopsis of the movie (max 60 words)." },
    cast: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Top 3-4 main actors." },
    director: { type: Type.STRING, description: "The director's name." },
    rating: { type: Type.STRING, description: "Estimated IMDB score (e.g. '8.2/10')." },
  },
  required: ["synopsis", "cast", "director", "rating"]
};

// In-memory cache for movie details to prevent redundant API calls
const detailsCache: Record<string, MovieDetails> = {};

export const getMovieRecommendations = async (mood: string): Promise<Movie[]> => {
  try {
    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Suggest 3 movies for a user who describes their current mood as: "${mood}". 
      Focus on a diverse selection (mix of classics and modern) that perfectly captures the requested vibe.
      Ensure the titles are the exact official release titles to help with searching for metadata.
      The 'reason' should be persuasive and directly address the mood.`,
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
        genre: "Adventure / Drama",
        reason: "Ideally we would have live results, but this is a great fallback for almost any mood involving seeking purpose.",
      },
      {
        id: 'error-fallback-2',
        title: "Paddington 2",
        year: 2017,
        genre: "Family / Comedy",
        reason: "If things failed, this movie is the digital equivalent of a warm hug to make you feel better.",
      },
      {
        id: 'error-fallback-3',
        title: "Arrival",
        year: 2016,
        genre: "Sci-Fi / Drama",
        reason: "A masterpiece about communication and understanding, fitting for technical difficulties.",
      }
    ];
  }
};

export const getMovieDetails = async (title: string, year: number): Promise<MovieDetails> => {
  const cacheKey = `${title}-${year}`;
  
  // Return cached details if available to avoid API latency
  if (detailsCache[cacheKey]) {
    return detailsCache[cacheKey];
  }

  try {
    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Provide detailed information for the movie "${title}" released in ${year}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: detailsSchema,
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No details found");
    
    const details = JSON.parse(jsonText) as MovieDetails;
    
    // Store in cache
    detailsCache[cacheKey] = details;
    
    return details;
  } catch (error) {
    console.error("Gemini Details Error", error);
    return {
      synopsis: "Details currently unavailable for this title.",
      cast: [],
      director: "Unknown",
      rating: "N/A"
    };
  }
}