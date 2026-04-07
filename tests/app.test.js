const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const createApp = require("../app");

test("GET /api/health returns the health payload", async () => {
  const response = await request(createApp()).get("/api/health");

  assert.equal(response.status, 200);
  assert.deepEqual(response.body, {
    success: true,
    message: "API is healthy",
  });
});

test("GET / returns the backend status message", async () => {
  const response = await request(createApp()).get("/");

  assert.equal(response.status, 200);
  assert.deepEqual(response.body, {
    message: "Backend is running successfully",
  });
});

test("unknown routes return the JSON error shape", async () => {
  const response = await request(createApp()).get("/does-not-exist");

  assert.equal(response.status, 404);
  assert.match(response.body.message, /Route not found/);
});
