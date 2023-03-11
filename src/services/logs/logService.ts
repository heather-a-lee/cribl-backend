import fs from "fs";
import readline from "readline";
import { createLogger, format, transports } from "winston";

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
    // console.log("i is", i);
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
  keyword?: string,
  n?: number
) {
  // TODO: Check if log file exists
  const readableStream = fs.createReadStream(`/var/log/${filename}`);
  const rl = readline.createInterface({
    input: readableStream,
    crlfDelay: Infinity,
  });
  // TODO: Use a stream to write result in case there are a lot of results
  const result = [];
  for await (const line of rl) {
    // console.log(`line is ${line}`);
    // logger.info(`Line recieved in buffer: ${line}`);
    if (keyword && boyerMooreSearch(line, keyword) === -1) {
      continue;
    }
    result.push(line);
  }
  return result;
}

export { getLogsByFilename };
