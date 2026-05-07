const request = require("supertest");
const { connectTestDB, disconnectTestDB } = require("../setup");

jest.mock("../../src/config/db", () => jest.fn().mockResolvedValue());

const app = require("../../src/app");
const User = require("../../src/models/User");
const Company = require("../../src/models/Company");
const Contact = require("../../src/models/Contact");

// ── Connect/Disconnect ──
beforeAll(async () => {
  await connectTestDB();
});

afterAll(async () => {
  await disconnectTestDB();
});

// ── Helper: register a user and return their token ──
const createUserAndGetToken = async (overrides = {}) => {
  const data = {
    name: "Test Owner",
    email: "owner@test.com",
    password: "password123",
    passwordConfirm: "password123",
    companyName: "Test Company",
    companyAddress: "123 Test Street",
    companyEmail: "company@test.com",
    companyPhone: "1234567890",
    ...overrides,
  };

  const res = await request(app).post("/api/v1/auth/register").send(data);
  return res.body.token;
};

// ── Clean all collections before each test ──
beforeEach(async () => {
  await User.deleteMany({});
  await Company.deleteMany({});
  await Contact.deleteMany({});
});

// ══════════════════════════════════════════════════════
// GET /api/v1/contacts  (list all)
// ══════════════════════════════════════════════════════
describe("GET /api/v1/contacts", () => {
  test("should return 401 without auth token", async () => {
    const res = await request(app).get("/api/v1/contacts");

    expect(res.statusCode).toBe(401);
  });

  test("should return empty contacts array for new user", async () => {
    const token = await createUserAndGetToken();

    const res = await request(app)
      .get("/api/v1/contacts")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.data.contacts).toEqual([]);
    expect(res.body.results).toBe(0);
  });
});

// ══════════════════════════════════════════════════════
// POST /api/v1/contacts  (create)
// ══════════════════════════════════════════════════════
describe("POST /api/v1/contacts", () => {
  test("should create a contact and auto-assign company & user", async () => {
    const token = await createUserAndGetToken();

    const res = await request(app)
      .post("/api/v1/contacts")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "John Doe",
        email: "john@example.com",
        phone: "1234567890",
        status: "new",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.contact.name).toBe("John Doe");
    // Server should auto-set these (not from request body)
    expect(res.body.data.contact.company).toBeDefined();
    expect(res.body.data.contact.assignedTo).toBeDefined();
  });

  test("should fail without required name field", async () => {
    const token = await createUserAndGetToken();

    const res = await request(app)
      .post("/api/v1/contacts")
      .set("Authorization", `Bearer ${token}`)
      .send({ email: "noname@example.com" });

    expect(res.statusCode).not.toBe(201);
  });
});

// ══════════════════════════════════════════════════════
// GET /api/v1/contacts/:id  (get one)
// ══════════════════════════════════════════════════════
describe("GET /api/v1/contacts/:id", () => {
  test("should return a specific contact", async () => {
    const token = await createUserAndGetToken();

    // Create a contact first
    const createRes = await request(app)
      .post("/api/v1/contacts")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Jane Doe", email: "jane@test.com" });

    const contactId = createRes.body.data.contact._id;

    // Get that contact
    const res = await request(app)
      .get(`/api/v1/contacts/${contactId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.contact.name).toBe("Jane Doe");
  });

  test("should return 404 for non-existent contact", async () => {
    const token = await createUserAndGetToken();
    const fakeId = new (require("mongoose").Types.ObjectId)();

    const res = await request(app)
      .get(`/api/v1/contacts/${fakeId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
  });
});

// ══════════════════════════════════════════════════════
// PATCH /api/v1/contacts/:id  (update)
// ══════════════════════════════════════════════════════
describe("PATCH /api/v1/contacts/:id", () => {
  test("should update a contact", async () => {
    const token = await createUserAndGetToken();

    // Create
    const createRes = await request(app)
      .post("/api/v1/contacts")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Old Name", email: "old@test.com" });

    const contactId = createRes.body.data.contact._id;

    // Update
    const res = await request(app)
      .patch(`/api/v1/contacts/${contactId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "New Name" });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.contact.name).toBe("New Name");
  });

  test("should NOT allow updating company field (security)", async () => {
    const token = await createUserAndGetToken();

    const createRes = await request(app)
      .post("/api/v1/contacts")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Test Contact" });

    const contactId = createRes.body.data.contact._id;
    const originalCompany = createRes.body.data.contact.company._id || createRes.body.data.contact.company;

    // Try to change company (should be blocked)
    const res = await request(app)
      .patch(`/api/v1/contacts/${contactId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ company: "hacked_company_id" });

    const updatedCompany = res.body.data.contact.company._id || res.body.data.contact.company;
    expect(updatedCompany).toBe(originalCompany);
  });
});

// ══════════════════════════════════════════════════════
// DELETE /api/v1/contacts/:id
// ══════════════════════════════════════════════════════
describe("DELETE /api/v1/contacts/:id", () => {
  test("should delete a contact (owner role)", async () => {
    const token = await createUserAndGetToken();

    // Create
    const createRes = await request(app)
      .post("/api/v1/contacts")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "To Delete" });

    const contactId = createRes.body.data.contact._id;

    // Delete
    const res = await request(app)
      .delete(`/api/v1/contacts/${contactId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(204);

    // Verify it's gone
    const getRes = await request(app)
      .get(`/api/v1/contacts/${contactId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(getRes.statusCode).toBe(404);
  });
});
