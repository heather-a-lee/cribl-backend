import fs, { ReadStream } from "fs";
import { ServerResponse } from "http";
import readline from "readline";
import { pipeline, Transform, Stream, Readable } from "stream";
import boyerMooreSearch from "../search/boyerMooreSearch";

class ReverseStreamProcessor extends Readable {
  filename = "";
  fileSize;
  chunkSize: number;
  bytesRead = 0;
  linesEmitted = 0;
  fileDescriptor: number;
  leftoverBuffer: string;
  maxMatches?: number;
  keywordFilter?: string;

  constructor(
    filename: string,
    opts: { maxMatches?: number; chunkSize?: number; keywordFilter?: string },
    readerOpts: {}
  ) {
    readerOpts = readerOpts || {};
    super(readerOpts);
    this.filename = filename;
    this.fileSize = fs.statSync(filename).size;
    this.fileDescriptor = fs.openSync(filename, "r");
    this.leftoverBuffer = "";
    this.chunkSize = opts.chunkSize || 1024;
    this.maxMatches = opts.maxMatches;
    this.keywordFilter = opts.keywordFilter;
  }

  _getNextLine(buffer: string) {
    let upcomingLine = buffer.slice(buffer.lastIndexOf("\n"));
    if (this.leftoverBuffer) {
      upcomingLine = upcomingLine + this.leftoverBuffer;
      this.leftoverBuffer = undefined;
    }
    // if (
    //   this.keywordFilter &&
    //   boyerMooreSearch(upcomingLine, this.keywordFilter) === -1
    // ) {
    //   return;
    // }
    return upcomingLine;
  }

  async _readChunks(chunkBuffer: Buffer, readBytes: number) {
    fs.readSync(
      this.fileDescriptor,
      chunkBuffer,
      0,
      readBytes,
      this.fileSize - this.bytesRead - this.chunkSize
    );

    let buffer = chunkBuffer.toString();

    while (
      // buffer.lastIndexOf("\n") !== buffer.length &&
      buffer.lastIndexOf("\n") !== -1
    ) {
      if (this.maxMatches && this.linesEmitted > this.maxMatches) {
        buffer = undefined;
        break;
      }

      const nextLine = this._getNextLine(buffer);
      if (nextLine !== undefined) {
        this.push(nextLine);
        this.linesEmitted += 1;
      }
      if (buffer.lastIndexOf("\n") > 0) {
        buffer = buffer.slice(0, buffer.lastIndexOf("\n"));
      } else {
        break;
      }
    }

    if (buffer && buffer.length > 0) {
      this.leftoverBuffer = buffer;
    }

    this.bytesRead += readBytes;
  }

  _read() {
    // TODO: Remove this capacity of 1024kb later -- easier to test for now
    if (
      this.bytesRead >= this.fileSize ||
      (this.maxMatches && this.linesEmitted >= this.maxMatches) // ||
      /* this.bytesRead >= 157286400 */ // 1/10th the size of the full 1.5GB file
    ) {
      // cap response at 1024kb
      if (this.leftoverBuffer) {
        this.push("\n" + this.leftoverBuffer);
      }
      this.push(null);
      return;
    }
    const readBytes = Math.min(this.chunkSize, this.fileSize - this.bytesRead);
    const chunkBuffer = Buffer.alloc(readBytes);
    this._readChunks(chunkBuffer, readBytes);
  }
}

export default ReverseStreamProcessor;
