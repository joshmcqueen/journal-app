import { Router, Request, Response } from 'express';
import { generateText } from 'ai';
import { anthropic } from '../services/ai.js';
import { config } from '../config.js';
import { POLISH_SYSTEM_PROMPT } from '../prompts.js';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  const { prompt } = req.body;
  if (typeof prompt !== 'string' || !prompt.trim()) {
    res.status(400).json({ error: 'Body must include a non-empty prompt string.' });
    return;
  }

  try {
    const { text } = await generateText({
      model: anthropic(config.CLAUDE_MODEL),
      system: POLISH_SYSTEM_PROMPT,
      prompt,
    });

    res.json({ text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to polish entry.' });
  }
});

export default router;
