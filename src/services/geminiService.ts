/**
 * GeminiService — thin wrapper around @google/genai for the VJEditor AI Studio.
 *
 * The API key is stored in localStorage so this works on GitHub Pages with no
 * server-side backend. Users enter their own Gemini API key once and it is
 * persisted for future sessions.
 */

import { GoogleGenAI } from '@google/genai';

const STORAGE_KEY = 'vjeditor.gemini.apiKey';
const MODEL_TEXT   = 'gemini-2.5-flash';
const MODEL_IMAGE  = 'imagen-3.0-generate-002';

// ─── API Key Management ──────────────────────────────────────────────────────

export function getApiKey(): string {
  return localStorage.getItem(STORAGE_KEY) ?? '';
}

export function setApiKey(key: string): void {
  if (key.trim()) {
    localStorage.setItem(STORAGE_KEY, key.trim());
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function hasApiKey(): boolean {
  return Boolean(getApiKey());
}

function getClient(): GoogleGenAI {
  const key = getApiKey();
  if (!key) throw new Error('No Gemini API key configured.');
  return new GoogleGenAI({ apiKey: key });
}

// ─── Generation Types ────────────────────────────────────────────────────────

export type GenerationType = 'video-script' | 'image-prompt' | 'voiceover' | 'concept' | 'image';

export interface GenerationResult {
  type: GenerationType;
  text?: string;          // generated text / script / prompt
  imageBase64?: string;   // base64-encoded PNG for image generation
  imageMimeType?: string;
}

// ─── Text Streaming ──────────────────────────────────────────────────────────

/**
 * Stream a Gemini text response chunk-by-chunk.
 * @param prompt  The user's raw instruction / description.
 * @param type    How to frame the generation request.
 * @param onChunk Called for each streaming token chunk.
 * @returns       The full concatenated response text.
 */
export async function generateText(
  prompt: string,
  type: GenerationType,
  onChunk: (delta: string) => void,
): Promise<GenerationResult> {
  const client = getClient();

  const systemPrompt = buildSystemPrompt(type);
  const fullPrompt = `${systemPrompt}\n\nUser request:\n${prompt}`;

  const stream = await client.models.generateContentStream({
    model: MODEL_TEXT,
    contents: fullPrompt,
  });

  let full = '';
  for await (const chunk of stream) {
    const delta = chunk.text ?? '';
    full += delta;
    onChunk(delta);
  }

  return { type, text: full };
}

/**
 * Generate an image using Gemini's image generation model.
 * Returns a base64 PNG data URL ready to use in <img src="..."/>.
 */
export async function generateImage(prompt: string): Promise<GenerationResult> {
  const client = getClient();

  try {
    const response = await client.models.generateImages({
      model: MODEL_IMAGE,
      prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/png',
      },
    });

    const base64 = response.generatedImages?.[0]?.image?.imageBytes;
    if (base64) {
      return { type: 'image', imageBase64: base64, imageMimeType: 'image/png', text: prompt };
    }
  } catch {
    // Fallback to gemini-2.0-flash multimodal
    try {
      const response = await client.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
        config: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
      });

      let imageBase64: string | undefined;
      let imageMimeType = 'image/png';
      let text = '';

      for (const part of response.candidates?.[0]?.content?.parts ?? []) {
        if (part.inlineData?.data) {
          imageBase64 = part.inlineData.data;
          imageMimeType = part.inlineData.mimeType ?? 'image/png';
        } else if (part.text) {
          text += part.text;
        }
      }

      if (imageBase64) {
        return { type: 'image', imageBase64, imageMimeType, text };
      }
    } catch {
      // Ignore inner fallback error
    }
  }

  throw new Error('No image was returned by the model. Try a different prompt.');
}

// ─── System Prompts ──────────────────────────────────────────────────────────

function buildSystemPrompt(type: GenerationType): string {
  switch (type) {
    case 'video-script':
      return `You are an expert video scriptwriter for short-form content (YouTube, TikTok, Instagram Reels).
Write a complete, scene-by-scene video script with:
- A punchy HOOK (first 3 seconds)
- Clear scene descriptions with camera direction
- Spoken voiceover lines
- Estimated scene duration
- On-screen text / title card suggestions
Format each scene as: [SCENE X – duration] Description | Voiceover | On-screen text
Keep total video under 90 seconds unless specified.`;

    case 'voiceover':
      return `You are a professional voiceover scriptwriter.
Write a natural, conversational voiceover script that is engaging and clear.
Include breathing pauses marked as [pause], emphasis words in *asterisks*, and speed hints like [fast] or [slow].
Match the tone to the content. Output only the voiceover text, ready to be read aloud.`;

    case 'image-prompt':
      return `You are an expert AI image prompt engineer.
Transform the user's idea into a detailed, optimized image generation prompt.
Include: subject, style (e.g. cinematic, photorealistic, anime), lighting, camera angle, mood, color palette.
Format: One dense descriptive paragraph, no bullet points.`;

    case 'concept':
      return `You are a creative director for viral video content.
Generate a complete video concept including:
- Title (click-worthy)
- Hook idea
- 5-7 scene breakdown
- Visual style & color palette
- Background music genre suggestion
- Target audience
- Estimated runtime
Be creative, specific, and production-ready.`;

    default:
      return 'You are a helpful AI assistant for a video editor application. Help the user with their request.';
  }
}
