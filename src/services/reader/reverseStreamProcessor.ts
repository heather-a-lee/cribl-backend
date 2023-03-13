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

  constructor(filename: string, opts: {}) {
    opts = opts || {};
    super(opts);
    this.filename = filename;
    this.fileSize = fs.statSync(filename).size;
    this.fileDescriptor = fs.openSync(filename, "r");
  }

  _reverseChunk(chunk: string) {
    // TODO: Implement own reverse function
    return chunk.split(/\r?\n/).reverse().join("\n");
  }

  async _readChunks(chunkBuffer: Buffer, readBytes: number) {
    fs.readSync(
      this.fileDescriptor,
      chunkBuffer,
      0,
      readBytes,
      this.fileSize - this.bytesRead - this.chunkSize
    );
    this.push(this._reverseChunk(chunkBuffer.toString()));
    // this.push(null); // TESTING IF WE GET MOST RECENT LOG
    this.bytesRead += readBytes;
  }

  _read() {
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
