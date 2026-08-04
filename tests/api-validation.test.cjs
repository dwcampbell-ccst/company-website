const test = require("node:test");
const assert = require("node:assert/strict");

const contact = require("../api/contact");
const introCall = require("../api/intro-call");
const auth = require("../api/auth");
const callback = require("../api/callback");

function response() {
  return {
    statusCode: 200,
    headers: {},
    body: undefined,
    status(code) { this.statusCode = code; return this; },
    setHeader(name, value) { this.headers[name.toLowerCase()] = value; return this; },
    json(value) { this.body = value; return this; },
    send(value) { this.body = value; return this; },
    redirect(code, location) { this.statusCode = code; this.headers.location = location; return this; },
  };
}

test("contact rejects invalid email before accessing external services", async () => {
  const res = response();
  await contact({ method: "POST", body: { name: "Test", email: "bad", message: "Hello" }, headers: {} }, res);
  assert.equal(res.statusCode, 400);
  assert.equal(res.body.error, "Invalid field value");
});

test("contact rejects incomplete or unapproved downloads", async () => {
  const incomplete = response();
  await contact({ method: "POST", body: { name: "Test", email: "test@example.com", message: "Hello", downloadPath: "/downloads/file.pdf" }, headers: {} }, incomplete);
  assert.equal(incomplete.statusCode, 400);

  const unapproved = response();
  await contact({ method: "POST", body: { name: "Test", email: "test@example.com", message: "Hello", downloadFilename: "file.pdf", downloadPath: "/downloads/file.pdf" }, headers: {} }, unapproved);
  assert.equal(unapproved.statusCode, 400);
});

test("contact rejects header injection attempts", async () => {
  const res = response();
  await contact({
    method: "POST",
    body: {
      name: "Test",
      email: "test@example.com",
      message: "Hello",
      subject: "Normal subject\r\nBcc: attacker@example.com",
    },
    headers: {},
  }, res);
  assert.equal(res.statusCode, 400);
  assert.equal(res.body.error, "Invalid subject");
});

test("intro-call endpoint rejects unsupported methods", async () => {
  const res = response();
  await introCall({ method: "GET" }, res);
  assert.equal(res.statusCode, 405);
});

test("CMS auth rejects unsupported methods and missing configuration", async () => {
  const wrongMethod = response();
  await auth({ method: "POST" }, wrongMethod);
  assert.equal(wrongMethod.statusCode, 405);

  const original = process.env.GITHUB_OAUTH_CLIENT_ID;
  delete process.env.GITHUB_OAUTH_CLIENT_ID;
  const missingConfig = response();
  await auth({ method: "GET", query: {} }, missingConfig);
  assert.equal(missingConfig.statusCode, 503);
  if (original) process.env.GITHUB_OAUTH_CLIENT_ID = original;
});

test("CMS callback rejects missing or mismatched state", async () => {
  const res = response();
  await callback({ method: "GET", query: { state: "wrong", code: "code" }, headers: { cookie: "decap_oauth_state=expected" } }, res);
  assert.equal(res.statusCode, 400);
  assert.match(res.body, /Invalid or expired authorization request/);
  assert.equal(res.headers["cache-control"], "no-store");
});
