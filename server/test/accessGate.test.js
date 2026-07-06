import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { accessGate } from "../src/middleware/accessGate.js";

function makeRes() {
  const res = { statusCode: null, body: null };
  res.status = (code) => ((res.statusCode = code), res);
  res.json = (body) => ((res.body = body), res);
  return res;
}

beforeEach(() => {
  delete process.env.ACCESS_CODE;
});

test("passes everything through when ACCESS_CODE is unset", () => {
  let called = false;
  accessGate({ headers: {} }, makeRes(), () => (called = true));
  assert.equal(called, true);
});

test("rejects requests without the code when gated", () => {
  process.env.ACCESS_CODE = "secret";
  const res = makeRes();
  let called = false;
  accessGate({ headers: {} }, res, () => (called = true));
  assert.equal(called, false);
  assert.equal(res.statusCode, 401);
  assert.equal(res.body.error.code, "ACCESS_CODE_REQUIRED");
});

test("rejects a wrong code", () => {
  process.env.ACCESS_CODE = "secret";
  const res = makeRes();
  let called = false;
  accessGate({ headers: { "x-access-code": "nope" } }, res, () => (called = true));
  assert.equal(called, false);
  assert.equal(res.statusCode, 401);
});

test("accepts the correct code", () => {
  process.env.ACCESS_CODE = "secret";
  let called = false;
  accessGate({ headers: { "x-access-code": "secret" } }, makeRes(), () => (called = true));
  assert.equal(called, true);
});
