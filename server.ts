import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "15mb" }));

// Helper to wrap raw 24kHz 16-bit PCM audio in a valid RIFF/WAV header
function ensureWavHeader(
  base64Data: string,
  sampleRate = 24000
): { base64: string; mimeType: string } {
  try {
    const pcmBuffer = Buffer.from(base64Data, "base64");
    // If it already has a RIFF header (WAV)
    if (pcmBuffer.length >= 4 && pcmBuffer.toString("utf8", 0, 4) === "RIFF") {
      return { base64: base64Data, mimeType: "audio/wav" };
    }
    // If it's an MP3 file
    if (pcmBuffer.length >= 3 && pcmBuffer.toString("utf8", 0, 3) === "ID3") {
      return { base64: base64Data, mimeType: "audio/mp3" };
    }

    // Wrap raw PCM into standard 16-bit mono 24kHz WAV
    const numChannels = 1;
    const bitsPerSample = 16;
    const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
    const blockAlign = numChannels * (bitsPerSample / 8);
    const dataSize = pcmBuffer.length;
    const header = Buffer.alloc(44);

    header.write("RIFF", 0);
    header.writeUInt32LE(36 + dataSize, 4);
    header.write("WAVE", 8);
    header.write("fmt ", 12);
    header.writeUInt32LE(16, 16);
    header.writeUInt16LE(1, 20); // PCM
    header.writeUInt16LE(numChannels, 22);
    header.writeUInt32LE(sampleRate, 24);
    header.writeUInt32LE(byteRate, 28);
    header.writeUInt16LE(blockAlign, 32);
    header.writeUInt16LE(bitsPerSample, 34);
    header.write("data", 36);
    header.writeUInt32LE(dataSize, 40);

    const wavBuffer = Buffer.concat([header, pcmBuffer]);
    return {
      base64: wavBuffer.toString("base64"),
      mimeType: "audio/wav",
    };
  } catch (err) {
    console.error("Error creating WAV container:", err);
    return { base64: base64Data, mimeType: "audio/wav" };
  }
}

// Check configuration
app.get("/api/config", (req, res) => {
  res.json({
    hasApiKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY"),
  });
});

// Text-to-speech endpoint
app.post("/api/tts", async (req, res) => {
  try {
    const {
      text,
      profileName,
      profileTitle,
      voiceName = "Puck",
      scene,
      directorNotes,
      customPromptDirectives,
    } = req.body;

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return res.status(400).json({ error: "Text is required to generate speech." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      return res.status(401).json({
        error: "GEMINI_API_KEY is not configured in the application environment.",
        code: "API_KEY_MISSING",
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    // Valid prebuilt voice names supported by Gemini TTS
    const validVoices = ["Puck", "Charon", "Kore", "Fenrir", "Zephyr"];
    const targetVoice = validVoices.includes(voiceName) ? voiceName : "Puck";

    // Compose rich audio profile guidance for the model
    let directive = `[AUDIO PROFILE: ${profileName || "Narrator"} - "${profileTitle || "Voice Character"}"]\n`;
    if (scene) {
      directive += `[THE SCENE: ${scene}]\n`;
    }
    if (directorNotes) {
      directive += `[DIRECTOR'S NOTES]\n`;
      if (directorNotes.style) directive += `- Style: ${directorNotes.style}\n`;
      if (directorNotes.dynamics) directive += `- Dynamics: ${directorNotes.dynamics}\n`;
      if (directorNotes.accent) directive += `- Accent: ${directorNotes.accent}\n`;
      if (directorNotes.pace) directive += `- Pace: ${directorNotes.pace}\n`;
      if (directorNotes.vocalTone) directive += `- Vocal Tone: ${directorNotes.vocalTone}\n`;
    }
    if (customPromptDirectives) {
      directive += `[ADDITIONAL INSTRUCTIONS]: ${customPromptDirectives}\n`;
    }

    directive += `\nPlease perform and speak the following text aloud with full emotional resonance, authentic vocal smiles/accents, cadence, and atmosphere as specified above:\n"${text.trim()}"`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: directive }] }],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: targetVoice },
          },
        },
      },
    });

    const candidate = response.candidates?.[0];
    const part = candidate?.content?.parts?.[0];
    const rawAudioBase64 = part?.inlineData?.data;

    if (!rawAudioBase64) {
      console.warn("No audio in response, candidate:", JSON.stringify(candidate));
      return res.status(502).json({
        error: "The model did not return synthesized audio. Please try again or check text length.",
      });
    }

    const { base64: audioBase64, mimeType } = ensureWavHeader(rawAudioBase64, 24000);

    return res.json({
      audioBase64,
      mimeType,
      voiceName: targetVoice,
      profileName,
    });
  } catch (error: any) {
    console.error("TTS generation error:", error);
    const errorMessage = error?.message || "Failed to generate speech.";
    return res.status(500).json({
      error: errorMessage,
      details: error?.status || "TTS_FAILED",
    });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
