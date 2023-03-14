import { ServerResponse } from "http";
import ReverseStreamProcessor from "../reader/reverseStreamProcessor";
import boyerMooreSearch from "../search/boyerMooreSearch";

function shouldWriteData(keyword: string, source: Buffer) {
  const foundInSearch =
    keyword && boyerMooreSearch(source.toString(), keyword) !== -1;
  const noKeyword = !keyword;
  return foundInSearch || noKeyword;
}

/**
 * Should support: filename to filter by, filter results based on keyword match, last n number of matching entries
 */
async function getLogsByFilename(
  filename: string,
  res: ServerResponse,
  keyword?: string,
  n?: number,
  byteOffset?: number
) {
  // TODO: Check if log file exists
  const reverseReadableStream = new ReverseStreamProcessor(
    filename,
    {
      chunkSize: 1110000, // 1.11MB
      byteOffset,
    },
    {}
  );

  let linesEmitted = 0;

  return new Promise((resolve, reject) => {
    console.time(__filename);
    reverseReadableStream.on("data", (data) => {
      if (shouldWriteData(keyword, data)) {
        res.write(data);
        linesEmitted += 1;
      }

      if (linesEmitted >= n) reverseReadableStream.destroy();
    });

    reverseReadableStream.on("error", (err) => {
      reject(err.message);
    });

    reverseReadableStream.on("close", () => {
      console.timeEnd(__filename);
      /** With more time, this could be written to a header or somewhere in the
       * response so the user knows where to paginate next. */
      console.log(
        "total bytes read",
        reverseReadableStream.getBytesRead(),
        reverseReadableStream.getTotalLines()
      );
      resolve(true);
      return;
    });
  });
}

export { getLogsByFilename };
