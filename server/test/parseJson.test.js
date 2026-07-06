import { test } from "node:test";
import assert from "node:assert/strict";
import { parseJson } from "../src/services/gemini.js";

test("parses clean JSON objects", () => {
  assert.deepEqual(parseJson('{"a": 1}'), { a: 1 });
});

test("parses clean JSON arrays", () => {
  assert.deepEqual(parseJson('[1, 2, 3]'), [1, 2, 3]);
});

test("strips markdown code fences", () => {
  assert.deepEqual(parseJson('```json\n{"a": 1}\n```'), { a: 1 });
  assert.deepEqual(parseJson('```\n{"a": 1}\n```'), { a: 1 });
});

test("extracts an object embedded in prose", () => {
  assert.deepEqual(
    parseJson('Here is the result:\n{"summary": "ok"}\nHope that helps!'),
    { summary: "ok" }
  );
});

test("extracts an array embedded in prose", () => {
  assert.deepEqual(parseJson('The entities are: ["a", "b"] as requested.'), ["a", "b"]);
});

test("handles nested braces inside the object", () => {
  assert.deepEqual(parseJson('x {"a": {"b": 2}} y'), { a: { b: 2 } });
});

test("throws a friendly error on garbage", () => {
  assert.throws(() => parseJson("not json at all"), /non-JSON output/);
  assert.throws(() => parseJson(""), /non-JSON output/);
  assert.throws(() => parseJson(undefined), /non-JSON output/);
});
