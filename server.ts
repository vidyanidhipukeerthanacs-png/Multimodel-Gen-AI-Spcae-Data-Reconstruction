import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

// Support large image payloads (up to 50MB)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Server-side Gemini AI client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Proxy image endpoint to prevent canvas CORS security tainting
app.get('/api/proxy-image', async (req, res) => {
  try {
    const imageUrl = req.query.url as string;
    if (!imageUrl) {
      return res.status(400).send('Missing url query parameter');
    }

    const response = await fetch(imageUrl);
    if (!response.ok) {
      return res.status(response.status).send(`Failed to fetch image: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type') || 'image/png';
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.setHeader('Content-Type', contentType);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.send(buffer);
  } catch (err: unknown) {
    console.error('Error in /api/proxy-image:', err);
    return res.status(500).send('Error proxying image');
  }
});

// Reconstruct image endpoint using Gemini Image Editing models
app.post('/api/reconstruct-image', async (req, res) => {
  try {
    const { image, mask, mimeType = 'image/png', strongRetry = false } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'Missing base64 image data in request body' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is not configured on the server. Please check your secrets in AI Studio.',
      });
    }

    // Strip data URL header if passed
    const damagedBase64 = image.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');
    const maskBase64 = mask ? mask.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '') : null;

    const basePrompt =
      'Image 1 is damaged. Image 2 is a mask: white areas are missing or damaged. Reconstruct ONLY the white areas by naturally continuing the surrounding content: shapes, edges, craters, textures, lighting and shading must match the visible parts. Do not change anything outside the white areas. Return only the full restored image at the same size.';

    const strongPrompt =
      'CRITICAL: Image 1 is damaged. Image 2 is a mask: white areas are missing or damaged. Reconstruct ONLY the white areas by naturally continuing the surrounding content: shapes, edges, craters, textures, lighting and shading must match the visible parts. Do not leave the black patch, hole or scratches intact. Do not change anything outside the white areas. Return only the full restored image at the same size.';

    const promptText = strongRetry ? strongPrompt : basePrompt;

    // Models: gemini-2.5-flash-image, fallback gemini-2.0-flash-preview-image-generation
    const candidateModels = [
      'gemini-2.5-flash-image',
      'gemini-2.0-flash-preview-image-generation',
      'gemini-3.1-flash-lite-image',
    ];

    let restoredBase64: string | null = null;
    let restoredMimeType = 'image/png';
    let lastError: string | null = null;
    let modelUsed = '';

    // Attempt generation with retry on failure
    for (const modelName of candidateModels) {
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          console.log(`Invoking ${modelName} (attempt ${attempt + 1})...`);
          const parts: Array<{ inlineData?: { data: string; mimeType: string }; text?: string }> = [
            {
              inlineData: {
                data: damagedBase64,
                mimeType: mimeType,
              },
            },
          ];

          if (maskBase64) {
            parts.push({
              inlineData: {
                data: maskBase64,
                mimeType: 'image/png',
              },
            });
          }

          parts.push({ text: promptText });

          const response = await ai.models.generateContent({
            model: modelName,
            contents: {
              parts,
            },
          });

          const resParts = response.candidates?.[0]?.content?.parts || [];
          for (const part of resParts) {
            if (part.inlineData?.data) {
              restoredBase64 = part.inlineData.data;
              restoredMimeType = part.inlineData.mimeType || 'image/png';
              modelUsed = modelName;
              break;
            }
          }

          if (restoredBase64) {
            break;
          } else {
            lastError = `Model ${modelName} returned response without inlineData image part.`;
          }
        } catch (err: unknown) {
          console.warn(`Error invoking ${modelName} attempt ${attempt + 1}:`, err);
          lastError = err instanceof Error ? err.message : String(err);
        }
      }
      if (restoredBase64) break;
    }

    if (!restoredBase64) {
      let displayError = lastError || "We couldn't reconstruct this image. Please try again.";
      try {
        const jsonMatch = displayError.match(/\{[\s\S]*"message"\s*:\s*"([^"]+)"[\s\S]*\}/);
        if (jsonMatch && jsonMatch[1]) {
          displayError = jsonMatch[1];
        } else {
          const parsed = JSON.parse(displayError);
          if (parsed?.error?.message) {
            displayError = parsed.error.message.split('\n')[0];
          }
        }
      } catch {
        // use displayError as-is
      }
      return res.status(502).json({
        error: displayError,
      });
    }

    return res.json({
      restoredImage: `data:${restoredMimeType};base64,${restoredBase64}`,
      model: modelUsed,
    });
  } catch (error: unknown) {
    console.error('Unhandled error in /api/reconstruct-image:', error);
    const msg = error instanceof Error ? error.message : "We couldn't reconstruct this image. Please try again.";
    return res.status(500).json({ error: msg });
  }
});

// Vite middleware in dev / static in prod
const isProd = process.env.NODE_ENV === 'production';
if (!isProd) {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static('dist'));
  app.get('*', (_req, res) => {
    res.sendFile('dist/index.html', { root: '.' });
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on http://0.0.0.0:${PORT}`);
});
