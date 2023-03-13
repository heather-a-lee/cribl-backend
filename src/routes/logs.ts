import { Router } from "express";
import { getLogsByFilename } from "../services/logs/logService";
import { z } from "zod";

const requestQuerySchema = z.object({
  filename: z.string(),
  keyword: z.string().optional(),
  n: z.string().optional(),
});

const routes = Router();

routes.get("/", async (req, res) => {
  try {
    const { query } = req;
    requestQuerySchema.parse(query);
    const { keyword, filename } = query;
    await getLogsByFilename(filename as string, res, keyword as string, 0);
    // return res.json({ logs: lines });
    console.log("calling res.end");
    return res.end();
  } catch (err) {
    console.log("err", err);
    return res.status(500).json({ error: [err.message] });
  }
});

export default routes;
