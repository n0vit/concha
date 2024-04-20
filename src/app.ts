import cors from 'cors';
import path from 'path';
import express, { Request, Response, Application } from 'express';
import bodyParser from 'body-parser';
// @ts-expect-error
import enrouten from 'express-enrouten';
import { fileURLToPath } from 'url';
import { error } from './utils/errors';

const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);

const app: Application = express();
const port = process.env.PORT || 8080;

app.set('x-powered-by', false);
app.set('trust proxy', true);

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const staticPath = path.join(__dirname, 'public');
const staticLogPath = path.join(__dirname, 'public/logs');

app.use(express.static(staticPath));
app.use(express.static(staticLogPath));

app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to Express & TypeScript Server');
});

app.use(enrouten({ directory: path.join(__dirname, 'controllers') }));
app.use(error);
app.listen(port, () => {
  console.log(`Node Server is Fire at http://localhost:${port}`);
});
