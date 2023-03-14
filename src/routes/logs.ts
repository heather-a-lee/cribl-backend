import { Router } from "express";
import { getLogsByFilename } from "../services/logs/logService";
const routes = Router();

routes.get("/", async (req, res) => {
  try {
    const { query } = req;
    const { keyword, filename, n, byteOffset } = query;
    if (!filename) {
      return res
        .status(400)
        .json({ error: "Missing required query parameter: filename" });
    }
    await getLogsByFilename(
      `/var/log/${filename}` as string,
      res,
      keyword as string,
      n ? Number(n) : undefined,
      byteOffset ? Number(byteOffset) : undefined
    );
    return res.end();
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default routes;
