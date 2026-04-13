import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config.js';
import entriesRouter from './routes/entries.js';
import polishRouter from './routes/polish.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/entries', entriesRouter);
app.use('/api/polish', polishRouter);

// Serve built client in production
const clientDist = path.resolve(__dirname, '../../client/dist');
app.use(express.static(clientDist));
app.get('*', (_req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

app.listen(config.PORT, () => {
  console.log(`Server running on http://localhost:${config.PORT}`);
});
