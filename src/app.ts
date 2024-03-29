import cors from "cors";
import { EthRewards } from "./core/ethereum";
import path from "path";
import { makeDetailsTable, makeSummaryTable } from "./core/ethereum/make-table";
import express, { Request, Response, Application } from "express";
import bodyParser from "body-parser";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);

const app: Application = express();
const port = process.env.PORT || 8080;

app.set("x-powered-by", false);
app.set("trust proxy", true);

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const staticPath = path.join(__dirname, "public");
app.use(express.static(staticPath));

app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to Express & TypeScript Server");
});

app.post("/start-scan", async (req: Request, res: Response) => {
  res.send("Scan started");
});

app.get("/summary-table", async (req: Request, res: Response) => {
  const type = req.query.type as "csv" | "pdf";
  const validators = JSON.parse(req.query.validators as string) as string[];
  console.log(typeof validators);
  const result = await makeSummaryTable(validators, type);

  res.send(result?.join(", "));
});

app.get("/details-table", async (req: Request, res: Response) => {
  const type = req.query.type as "csv" | "pdf";
  const validators = JSON.parse(req.query.validators as string) as string[];
  console.log(typeof validators);
  const result = await makeDetailsTable(validators, type);

  res.send(result?.join(", "));
});
app.listen(port, () => {
  EthRewards.EthRewardsCanner(1);
  console.log(`Server is Fire at http://localhost:${port}`);
});

//apt install python
//git clone https://github.com/n0vit/concha
//curl -fsSL https://get.pnpm.io/install.sh | sh -
//curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
//source /root/.bashrc
//nvm install 20
