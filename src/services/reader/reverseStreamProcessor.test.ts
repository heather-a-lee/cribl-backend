import { describe, expect, test } from "@jest/globals";
import path from "path";
import ReverseStreamProcessor from "./reverseStreamProcessor";

describe("reverseStreamProcessor", () => {
  test("it is able to parse a small file and render in reverse order", async () => {
    const reverseStreamProcessor = new ReverseStreamProcessor(
      path.resolve(__dirname, "./mocks/smallFile"),
      {},
      {}
    );
    const reverseStream = new Promise((resolve, _) => {
      const results: any[] = [];
      reverseStreamProcessor.on("data", (data) => {
        results.push(data.toString());
      });
      reverseStreamProcessor.on("end", () => {
        resolve(results);
      });
    });
    const results = await reverseStream;
    expect(results).toEqual(["\nghi", "\ndef", "\nabc"]);
  });
  test("it is able to handle a file with new lines in the front and end", async () => {
    const reverseStreamProcessor = new ReverseStreamProcessor(
      path.resolve(__dirname, "./mocks/newLineFile"),
      {},
      {}
    );
    const reverseStream = new Promise((resolve, _) => {
      const results: any[] = [];
      reverseStreamProcessor.on("data", (data) => {
        results.push(data.toString());
      });
      reverseStreamProcessor.on("end", () => {
        resolve(results);
      });
    });
    const results = await reverseStream;
    expect(results).toEqual(["\n", "\ndef"]);
  });
});
