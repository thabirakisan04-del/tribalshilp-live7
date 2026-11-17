export const MODEL_NAME = 'gemini-3.8-flash';

function getApiKey() {
  return import.meta.env.VITE_GEMINI_API_KEY || '';
}

export async function askGemini(prompt, options = {}) {
  const apiKey = getApiKey();

  if (!apiKey) {
    return {
      ok: false,
      error: 'Missing VITE_GEMINI_API_KEY. Create a .env file with your Google Gemini key and restart the app.',
    };
  }

  try {
    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
    };

    if (options.imageDataUrl) {
      const match = options.imageDataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.*)$/);
      if (match) {
        payload.contents[0].parts.push({
          inlineData: {
            mimeType: match[1],
            data: match[2],
          },
        });
      }
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${options.model || MODEL_NAME}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      },
    );

    const data = await response.json();

    if (!response.ok || data?.error) {
      const errorMessage = data?.error?.message || 'Gemini API request failed.';
      return { ok: false, error: errorMessage };
    }

    const text =
      data?.candidates?.[0]?.content?.parts
        ?.map((part) => part.text)
        .join('\n') || 'No response received from Gemini.';

    return { ok: true, text, data };
  } catch (error) {
    return {
      ok: false,
      error: error.message || 'Unexpected Gemini request error.',
    };
  }
}

export async function analyzeLeaf({ cropName, description, image, prompt }) {
  const apiKey = getApiKey();

  if (!apiKey) {
    return {
      ok: false,
      error: 'Missing VITE_GEMINI_API_KEY. Add the key to .env to enable crop analysis.',
    };
  }

  try {
    const finalPrompt = `
      Analyze this crop leaf for Indian agriculture conditions.
      Crop: ${cropName}
      Notes: ${description}
      Instructions:
      1. Return valid JSON only.
      2. Use fields: disease, confidence, summaryEn, summaryOdia, remedyEn, remedyOdia, cropName.
      3. Confidence should be a number between 0 and 100.
      4. Include organic home remedies in both English and Odia.
      5. If image is unavailable, still provide a cautious general answer.
      ${prompt || ''}
    `;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: finalPrompt },
                ...(image
                  ? [
                      {
                        inlineData: {
                          mimeType: 'image/jpeg',
                          data: image.replace(/^data:image\/\w+;base64,/, ''),
                        },
                      },
                    ]
                  : []),
              ],
            },
          ],
        }),
      },
    );

    const data = await response.json();

    if (!response.ok || data?.error) {
      const errorMessage = data?.error?.message || 'Leaf analysis failed.';
      return { ok: false, error: errorMessage };
    }

    const rawText =
      data?.candidates?.[0]?.content?.parts
        ?.map((part) => part.text)
        .join('\n') || '{}';

    const cleaned = rawText.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    return {
      ok: true,
      data: {
        disease: parsed.disease || 'Inspect carefully',
        confidence: Number(parsed.confidence) || 0,
        summaryEn: parsed.summaryEn || 'Leaf review complete.',
        summaryOdia: parsed.summaryOdia || 'ପତ୍ର ପରୀକ୍ଷା ସମ୍ପୂର୍ଣ୍ଣ।',
        remedyEn: parsed.remedyEn || 'Maintain healthy soil, balanced irrigation, and remove infected leaves.',
        remedyOdia: parsed.remedyOdia || 'ସୁସ୍ଥ ମାଟି, ସମତୁଳନ ଜଳସେଚନ ଏବଂ କ୍ଷତିଗ୍ରସ୍ତ ପତ୍ର ହଟାନ୍ତୁ।',
        cropName: parsed.cropName || cropName || 'Crop',
      },
    };
  } catch (error) {
    return {
      ok: false,
      error: error.message || 'Unable to parse leaf analysis output.',
    };
  }
}
