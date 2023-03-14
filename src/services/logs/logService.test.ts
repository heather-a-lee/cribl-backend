import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import path from "path";
import { getLogsByFilename } from "./logService";
import httpMocks from "node-mocks-http";

describe("logService", () => {
  it("works without throwing an error", async () => {
    var response = httpMocks.createResponse({
      eventEmitter: require("events").EventEmitter,
    });
    await getLogsByFilename(
      path.join(__dirname, "..", "reader", "mocks", "smallFile"),
      response
    );
    expect(response.statusCode).toEqual(200);
  });
});
