import { GoogleGenAI, Type } from "@google/genai";
import { StoreInfo } from '../types';

const getAi = () => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};


export const fetchStoreInfo = async (): Promise<StoreInfo> => {
  const ai = getAi();
  const prompt = `Generate fictional but realistic information for a luxury jewelry brand in India called "Shri Murari Jewellers Pvt. Ltd.".
  
  Provide details for:
  1. Two store locations (one flagship in a metro city, one in another major city). Include a name, full address, and a phone number for each.
  2. Bios for two fictional directors. Include their name, title (e.g., 'Founder & CEO', 'Creative Director'), and a short, professional bio (2-3 sentences).
  
  Format the entire output as a single JSON object.`;
  
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          stores: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                address: { type: Type.STRING },
                phone: { type: Type.STRING },
              },
              required: ["name", "address", "phone"],
            },
          },
          directors: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                title: { type: Type.STRING },
                bio: { type: Type.STRING },
              },
              required: ["name", "title", "bio"],
            },
          },
        },
        required: ["stores", "directors"],
      },
    },
  });

  const jsonString = response.text.trim();
  const data = JSON.parse(jsonString);
  return data as StoreInfo;
};
