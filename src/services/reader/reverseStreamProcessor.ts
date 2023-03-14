import fs from "fs";
import util from "util";
import { Readable } from "stream";

const read = util.promisify(fs.read);

class ReverseStreamProcessor extends Readable {
  filename = "";
  fileSize;
  chunkSize: number;
  bytesRead = 0;
  byteOffset = 0;
  linesEmitted = 0;
  fileDescriptor: number;
  leftoverBuffer: string;

  constructor(
    filename: string,
    opts: { chunkSize?: number; byteOffset?: number },
    readerOpts: {}
  ) {
    readerOpts = readerOpts || {};
    super(readerOpts);
    this.filename = filename;
    this.fileSize = fs.statSync(filename).size;
    this.fileDescriptor = fs.openSync(filename, "r");
    this.leftoverBuffer = "";
    this.chunkSize = opts.chunkSize || 1024;
    this.byteOffset = opts.byteOffset || 0;
  }

  _getNextLine(buffer: string) {
    let upcomingLine = buffer.slice(buffer.lastIndexOf("\n"));
    if (this.leftoverBuffer) {
      upcomingLine = upcomingLine + this.leftoverBuffer;
      this.leftoverBuffer = undefined;
    }
    return upcomingLine;
  }

  async _readChunks(chunkBuffer: Buffer, readBytes: number) {
    const { buffer: cBuffer, bytesRead } = await read(
      this.fileDescriptor,
      chunkBuffer,
      0,
      readBytes,
      this.fileSize - this.byteOffset - this.bytesRead - this.chunkSize
    );

    let buffer = cBuffer.toString();

    while (buffer.lastIndexOf("\n") !== -1) {
      const nextLine = this._getNextLine(buffer);
      this.push(nextLine);

      this.linesEmitted += 1;

      if (buffer.lastIndexOf("\n") >= 0) {
        buffer = buffer.slice(0, buffer.lastIndexOf("\n"));
      } else {
        break;
      }
    }

    if (buffer && buffer.length > 0) {
      this.leftoverBuffer = buffer;
    }

    this.bytesRead += bytesRead;
  }

  async _read() {
    if (
      this.bytesRead >= this.fileSize ||
      this.bytesRead >= 104857600 // max size is 100MB
    ) {
      if (this.leftoverBuffer) {
        this.push("\n" + this.leftoverBuffer);
      }
      // close the buffer
      this.push(null);
      return;
    }
    if (this.fileSize - this.byteOffset - this.bytesRead <= 0) {
      return this.push(null);
    }
    const readBytes = Math.min(
      this.chunkSize,
      this.fileSize - this.byteOffset - this.bytesRead
    );
    // console.debug("Memory allocation", process.memoryUsage());
    const chunkBuffer = Buffer.alloc(readBytes);
    await this._readChunks(chunkBuffer, readBytes);
  }

  /**
   * Gets the total number of bytes read from file.
   * @returns number
   */
  getBytesRead() {
    return this.byteOffset + this.bytesRead;
  }

  getTotalLines() {
    return this.linesEmitted;
  }
}

export default ReverseStreamProcessor;
