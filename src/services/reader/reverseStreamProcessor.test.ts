import { describe, expect, test } from "@jest/globals";
import path from "path";
import ReverseStreamProcessor from "./reverseStreamProcessor";

describe("reverseStreamProcessor", () => {
  test("it is able to parse a small file", async () => {
    const reverseStreamProcessor = new ReverseStreamProcessor(
      path.resolve(__dirname, "./mocks/smallFile"),
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
    console.log("results", results);
  });
  test("it is able to parse a huge 1GB file", async () => {
    const reverseStreamProcessor = new ReverseStreamProcessor(
      "/var/log/HDFS.log",
      {}
    );
    const reverseStream = new Promise((resolve, _) => {
      const results: any[] = [];
      reverseStreamProcessor.on("data", (data) => {
        console.log("pushing", data.toString());
        results.push(data.toString());
      });
      reverseStreamProcessor.on("end", () => {
        resolve(results);
      });
    });
    const results = await reverseStream;
    console.log("results", results);
  }, 500000);
});
