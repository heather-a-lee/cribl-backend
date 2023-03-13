import fs, { ReadStream } from "fs";
import { ServerResponse } from "http";
import readline from "readline";
import { pipeline, Transform, Stream, Readable } from "stream";

class ReverseStreamProcessor extends Readable {
  filename = "";
  fileSize;
  chunkSize = 1024;
  bytesRead = 0;
  fileDescriptor: number;
  leftoverBuffer: string;

  constructor(filename: string, opts: {}) {
    opts = opts || {};
    super(opts);
    this.filename = filename;
    this.fileSize = fs.statSync(filename).size;
    this.fileDescriptor = fs.openSync(filename, "r");
    this.leftoverBuffer = "";
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
      buffer.lastIndexOf("\n") !== buffer.length &&
      buffer.lastIndexOf("\n") !== -1
    ) {
      if (this.leftoverBuffer) {
        this.push(buffer.slice(buffer.lastIndexOf("\n")) + this.leftoverBuffer);
        this.leftoverBuffer = undefined;
      } else {
        this.push(buffer.slice(buffer.lastIndexOf("\n")));
      }
      if (buffer.lastIndexOf("\n") > 0) {
        buffer = buffer.slice(0, buffer.lastIndexOf("\n") - 1);
      } else {
        break;
      }
    }

    if (buffer.length > 0) {
      this.leftoverBuffer = buffer;
    }
    this.bytesRead += readBytes;
  }

  _read() {
    // TODO: Remove this capacity of 1024kb later -- easier to test for now
    if (this.bytesRead >= this.fileSize || this.bytesRead >= 1024000) {
      // cap response at 1024kb
      this.push(null);
      return;
    }
    const readBytes = Math.min(this.chunkSize, this.fileSize - this.bytesRead);
    const chunkBuffer = Buffer.alloc(readBytes);
    this._readChunks(chunkBuffer, readBytes);
  }
}

export default ReverseStreamProcessor;
