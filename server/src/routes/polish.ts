import { Router, Request, Response } from 'express';
import { streamText } from 'ai';
import { anthropic } from '../services/ai.js';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  const { prompt } = req.body;
  if (typeof prompt !== 'string' || !prompt.trim()) {
    res.status(400).json({ error: 'Body must include a non-empty prompt string.' });
    return;
  }

  try {
    const result = streamText({
      model: anthropic('claude-sonnet-4-6'),
      system:
        'You are a helpful journaling assistant. Clean up and polish the user\'s rough notes into clear, well-structured prose. Preserve all facts and meaning. Use first person. Keep it personal and authentic. Return only the polished text with no preamble or explanation.',
      prompt,
    });

    result.pipeDataStreamToResponse(res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to polish entry.' });
  }
});

export default router;
