import { describe, expect, test } from "@jest/globals";
import boyerMooreSearch from "./boyerMooreSearch";

describe("boyerMooreSearch", () => {
  test("it is able to find a match for two matching strings", async () => {
    let result = boyerMooreSearch("hello world", "hello");
    expect(result).toEqual(0);
    result = boyerMooreSearch("world hello", "hello");
    expect(result).toEqual(6);
    result = boyerMooreSearch("hello", "hello");
    expect(result).toEqual(0);
  });
  test("it is able to return -1 for non matching strings", async () => {
    let result = boyerMooreSearch("zzzzzz", "hello");
    expect(result).toEqual(-1);
    result = boyerMooreSearch("", "abc");
    expect(result).toEqual(-1);
    result = boyerMooreSearch("", "");
    expect(result).toEqual(-1);
  });
});
