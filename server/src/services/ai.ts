import { createAnthropic } from '@ai-sdk/anthropic';
import { config } from '../config.js';

export const anthropic = createAnthropic({ apiKey: config.ANTHROPIC_API_KEY });
