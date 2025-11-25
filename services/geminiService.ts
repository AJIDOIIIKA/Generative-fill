import { GoogleGenAI } from "@google/genai";
import { AspectRatio } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Sends an image to Gemini to extend/fill the background based on the new aspect ratio.
 */
export const generateExtendedImage = async (
  base64Image: string,
  mimeType: string,
  prompt: string,
  ratio: AspectRatio
): Promise<string> => {
  try {
    // Construct a prompt that instructs the model to act as an outpainting engine
    const finalPrompt = prompt 
      ? `Change the aspect ratio to ${ratio}. Extend the image content to fill the new space seamlessly. Context: ${prompt}`
      : `Change the aspect ratio to ${ratio}. Seamlessly extend the background to fill the frame, maintaining the original lighting, style, and texture. Do not crop the main subject.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
            {
                text: finalPrompt
            },
            {
                inlineData: {
                    data: base64Image,
                    mimeType: mimeType
                }
            }
        ]
      },
      config: {
        imageConfig: {
            aspectRatio: ratio,
        }
      }
    });

    // Extract the generated image
    if (response.candidates && response.candidates.length > 0) {
        const parts = response.candidates[0].content.parts;
        for (const part of parts) {
            if (part.inlineData && part.inlineData.data) {
                return `data:image/png;base64,${part.inlineData.data}`;
            }
        }
    }

    throw new Error("No image data found in response");
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to generate image");
  }
};
