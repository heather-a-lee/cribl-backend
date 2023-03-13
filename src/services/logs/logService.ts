import { ServerResponse } from "http";
import { pipeline, Transform } from "stream";
import { createLogger, format, transports } from "winston";
import BoyersMooreSearchFilter from "../reader/boyersMooreTransform";
import ReverseStreamProcessor from "../reader/reverseStreamProcessor";
import boyerMooreSearch from "../search/boyerMooreSearch";

// TODO: Move this to a shared logger file
const logLevels = {
  fatal: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
  trace: 5,
};

const logger = createLogger({
  levels: logLevels,
  transports: [new transports.Console()],
});

/**
 * Should support: filename to filter by, filter results based on keyword match, last n number of matching entries
 */
async function getLogsByFilename(
  filename: string,
  res: ServerResponse,
  keyword?: string,
  n?: number
) {
  // TODO: Check if log file exists
  const reverseReadableStream = new ReverseStreamProcessor(
    `/var/log/${filename}`,
    {
      maxMatches: n ?? undefined,
      chunkSize: /* 1024 * 16 */ 157286400,
    },
    {}
  );
  // TODO: Use a stream to write result in case there are a lot of results
  console.time(__filename);

  let transformer: Transform | undefined;
  if (keyword) {
    transformer = new BoyersMooreSearchFilter(keyword);
  }

  // await pipeline(reverseReadableStream, transformer, res, (err) =>
  //   console.log(err)
  // );

  return new Promise((resolve, reject) => {
    // if (transformer) {
    //   reverseReadableStream.pipe(transformer as Transform);
    // }
    reverseReadableStream.on("data", (data) => {
      // console.log("already writing data", data);
      // res.write(data);
      if (keyword && boyerMooreSearch(data.toString(), keyword) !== -1) {
        res.write(data);
      } else if (!keyword) {
        res.write(data);
      }
    });

    reverseReadableStream.on("close", () => {
      console.timeEnd(__filename);
      resolve(true);
      return;
    });
  });
  // return result;
}

export { getLogsByFilename };
