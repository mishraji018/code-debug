import { chatWithGroq } from '../services/chatService.js';

export async function chat(req, res) {
  const { prompt, context } = req.body;

  if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
    return res.status(400).json({
      ok: false,
      error: 'prompt is required and must be a non-empty string.',
    });
  }

  const result = await chatWithGroq({ prompt, context });

  if (!result.ok) {
    return res.status(502).json(result);
  }

  return res.status(200).json(result);
}
