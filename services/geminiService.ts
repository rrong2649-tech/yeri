
import { GoogleGenAI, Modality } from "@google/genai";

export class GeminiService {
  private ai: GoogleGenAI;
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.API_KEY || '';
    this.ai = new GoogleGenAI({ apiKey: this.apiKey });
  }

  // Purely for Text-to-Speech now
  async generateSpeech(text: string, speaker: string): Promise<string | undefined> {
    if (!this.apiKey || !text) return;

    let voiceName = 'Fenrir'; // Default/System
    
    if (speaker?.includes('鹿') || speaker?.includes('Ziyu')) {
      voiceName = 'Kore'; 
    } else if (speaker?.includes('陈') || speaker?.includes('Ximeng')) {
      voiceName = 'Zephyr'; 
    } else if (speaker?.includes('混混') || speaker?.includes('胡')) {
        voiceName = 'Puck'; 
    }

    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voiceName },
            },
          },
        },
      });
      return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    } catch (e) {
      console.error("TTS Error", e);
      return undefined;
    }
  }
}
