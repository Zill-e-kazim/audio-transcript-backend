import cors, { CorsOptions } from "cors";
import dotenv from "dotenv";
import express, { Express, Request, Response } from "express";
import fs from "fs/promises";
import multer, { diskStorage } from "multer";

const storage = diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, req.body.fileName);
  },
});

const upload = multer({ storage });

interface IData {
  fileName: string;
  transript: string;
  isCompleted: boolean;
}

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

const corsOptions: CorsOptions = {
  origin: ["http://localhost:3000", "http://44.202.4.202:80"],
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  credentials: true,
  preflightContinue: true,
};
app.use(cors(corsOptions));

app.options("*", cors());

app.get("/", async (req: Request, res: Response) => {
  const json: IData[] = JSON.parse(await fs.readFile("data.json", "utf-8"));
  res.json(json.filter((i) => !i.isCompleted)[0]);
});

app.post(
  "/submit",
  upload.single("recording"),
  async (req: Request, res: Response) => {
    const fileName = req.query["fileName"] as string;
    const json: IData[] = JSON.parse(await fs.readFile("data.json", "utf-8"));
    const index = json.findIndex((i) => i.fileName === fileName);
    json[index].isCompleted = true;
    await fs.writeFile("data.json", JSON.stringify(json));

    res.status(200).send();
  }
);

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
