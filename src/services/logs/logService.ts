import { ServerResponse } from "http";
import { createLogger, format, transports } from "winston";
import ReverseStreamProcessor from "../reader/reverseStreamProcessor";

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

const generateShiftTable = (pattern: string) => {
  const shift: { [key: string]: number } = {};
  for (let i = 0; i < pattern.length - 1; i++) {
    shift[pattern[i]] = Math.max(1, pattern.length - i - 1);
  }
  const lastChar = pattern[pattern.length - 1];
  if (shift[lastChar] === undefined) {
    shift[lastChar] = pattern.length;
  }
  return shift;
};

/**
 * grep uses Boyer's Moore under the hood to quickly find matching patterns.
 */
function boyerMooreSearch(source: string, pattern: string) {
  const shiftTable = generateShiftTable(pattern);
  const maxOffset = source.length - pattern.length;
  const patternLastIndex = pattern.length - 1;
  let offset = 0;
  while (offset <= maxOffset) {
    let scanIndex = 0;
    while (
      scanIndex < pattern.length &&
      pattern[scanIndex] == source[scanIndex + offset]
    ) {
      if (scanIndex === patternLastIndex) return offset;
      scanIndex++;
    }

    const badMatch = source[offset + patternLastIndex];
    let shift = shiftTable[badMatch];
    if (shift) {
      offset += shift;
    } else {
      offset += 1;
    }
  }
  return -1;
}

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
    {}
  );
  // TODO: Use a stream to write result in case there are a lot of results
  console.time(__filename);

  return new Promise((resolve, reject) => {
    reverseReadableStream.on("data", (data) => {
      if (keyword && boyerMooreSearch(data.toString(), keyword) !== -1) {
        res.write(data);
      } else if (!keyword) {
        res.write(data);
      }
    });

    reverseReadableStream.on("end", () => {
      console.timeEnd(__filename);
      resolve(true);
      return;
    });
  });
  // return result;
}

export { getLogsByFilename };
