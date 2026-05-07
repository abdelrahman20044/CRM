const request = require("supertest");
const mongoose = require("mongoose");
const { connectTestDB, disconnectTestDB } = require("../setup");

// Mock connectDB so the app middleware doesn't connect to the REAL database);
jest.mock("../../src/config/db", () => jest.fn().mockResolvedValue());

const app = require("../../src/app");
const User = require("../../src/models/User");
const Company = require("../../src/models/Company");

// ── Connect to test DB before tests, cleanup after ──
beforeAll(async () => {
  await connectTestDB();
});

afterAll(async () => {
  await disconnectTestDB();
});

// ── Clean users & companies before EACH test so tests don't affect each other ──
beforeEach(async () => {
  await User.deleteMany({});
  await Company.deleteMany({});
});

// Valid registration data (includes ALL required Company fields)
const validData = {
  name: "Test User",
  email: "test@example.com",
  password: "password123",
  passwordConfirm: "password123",
  companyName: "Test Company",
  companyAddress: "123 Test Street",
  companyEmail: "company@test.com",
  companyPhone: "1234567890",
};

// ══════════════════════════════════════════════════════
// REGISTER
// ══════════════════════════════════════════════════════
describe("POST /api/v1/auth/register", () => {
  test("should register a new user and return a token", async () => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send(validData);

    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe("success");
    expect(res.body.token).toBeDefined();
    expect(res.body.data.user.name).toBe("Test User");
    expect(res.body.data.user.role).toBe("owner"); // first user = owner
  });

  test("should NOT expose password in the response", async () => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send(validData);

    expect(res.body.data.user.password).toBeUndefined();
  });

  test("should fail when passwords don't match", async () => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({ ...validData, passwordConfirm: "differentpassword" });

    expect(res.statusCode).not.toBe(201);
  });

  test("should fail with duplicate email", async () => {
    // Register once
    await request(app).post("/api/v1/auth/register").send(validData);

    // Try again with same email
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send(validData);

    expect(res.statusCode).not.toBe(201);
  });
});

// ══════════════════════════════════════════════════════
// LOGIN
// ══════════════════════════════════════════════════════
describe("POST /api/v1/auth/login", () => {
  // Create a user before login tests
  beforeEach(async () => {
    await request(app).post("/api/v1/auth/register").send(validData);
  });

  test("should login with correct credentials and return token", async () => {
    const res = await request(app).post("/api/v1/auth/login").send({
      email: "test@example.com",
      password: "password123",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.token).toBeDefined();
  });

  test("should return 401 for wrong password", async () => {
    const res = await request(app).post("/api/v1/auth/login").send({
      email: "test@example.com",
      password: "wrongpassword",
    });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Invalid email or password");
  });

  test("should return 401 for non-existent email", async () => {
    const res = await request(app).post("/api/v1/auth/login").send({
      email: "nobody@example.com",
      password: "password123",
    });

    expect(res.statusCode).toBe(401);
  });
});

// ══════════════════════════════════════════════════════
// GET /me  (protected route)
// ══════════════════════════════════════════════════════
describe("GET /api/v1/auth/me", () => {
  test("should return 401 without a token", async () => {
    const res = await request(app).get("/api/v1/auth/me");

    expect(res.statusCode).toBe(401);
  });

  test("should return the current user with a valid token", async () => {
    // Register to get a token
    const registerRes = await request(app)
      .post("/api/v1/auth/register")
      .send(validData);

    const token = registerRes.body.token;

    // Use that token to access /me
    const res = await request(app)
      .get("/api/v1/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.user.email).toBe("test@example.com");
  });

  test("should return 401 with an invalid token", async () => {
    const res = await request(app)
      .get("/api/v1/auth/me")
      .set("Authorization", "Bearer invalidtoken123");

    expect(res.statusCode).toBe(401);
  });
});
