const request = require("supertest");
const { connectTestDB, disconnectTestDB } = require("../setup");

jest.mock("../../src/config/db", () => jest.fn().mockResolvedValue());

const app = require("../../src/app");
const User = require("../../src/models/User");
const Company = require("../../src/models/Company");
const Contact = require("../../src/models/Contact");
const Deal = require("../../src/models/Deal");

// ── Connect/Disconnect ──
beforeAll(async () => {
  await connectTestDB();
});

afterAll(async () => {
  await disconnectTestDB();
});

// ── Helper: register user, create contact, return { token, contactId } ──
const setupUserAndContact = async () => {
  const registerRes = await request(app)
    .post("/api/v1/auth/register")
    .send({
      name: "Test Owner",
      email: "owner@test.com",
      password: "password123",
      passwordConfirm: "password123",
      companyName: "Test Company",
      companyAddress: "123 Test Street",
      companyEmail: "company@test.com",
      companyPhone: "1234567890",
    });

  const token = registerRes.body.token;

  // Create a contact (deals require a contact)
  const contactRes = await request(app)
    .post("/api/v1/contacts")
    .set("Authorization", `Bearer ${token}`)
    .send({ name: "Deal Contact", email: "deal-contact@test.com" });

  return { token, contactId: contactRes.body.data.contact._id };
};

// ── Clean all collections before each test ──
beforeEach(async () => {
  await User.deleteMany({});
  await Company.deleteMany({});
  await Contact.deleteMany({});
  await Deal.deleteMany({});
});

// ══════════════════════════════════════════════════════
// GET /api/v1/deals  (list all)
// ══════════════════════════════════════════════════════
describe("GET /api/v1/deals", () => {
  test("should return 401 without auth token", async () => {
    const res = await request(app).get("/api/v1/deals");
    expect(res.statusCode).toBe(401);
  });

  test("should return empty deals array for new user", async () => {
    const { token } = await setupUserAndContact();

    const res = await request(app)
      .get("/api/v1/deals")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.deals).toEqual([]);
    expect(res.body.results).toBe(0);
  });
});

// ══════════════════════════════════════════════════════
// POST /api/v1/deals  (create)
// ══════════════════════════════════════════════════════
describe("POST /api/v1/deals", () => {
  test("should create a deal linked to a contact", async () => {
    const { token, contactId } = await setupUserAndContact();

    const res = await request(app)
      .post("/api/v1/deals")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Website Redesign",
        value: 5000,
        contact: contactId,
        stage: "lead",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.deal.title).toBe("Website Redesign");
    expect(res.body.data.deal.value).toBe(5000);
    expect(res.body.data.deal.stage).toBe("lead");
    expect(res.body.data.deal.company).toBeDefined();
    expect(res.body.data.deal.assignedTo).toBeDefined();
  });

  test("should fail without required title", async () => {
    const { token, contactId } = await setupUserAndContact();

    const res = await request(app)
      .post("/api/v1/deals")
      .set("Authorization", `Bearer ${token}`)
      .send({ value: 1000, contact: contactId });

    expect(res.statusCode).not.toBe(201);
  });

  test("should fail with invalid contact ID", async () => {
    const { token } = await setupUserAndContact();
    const fakeContactId = new (require("mongoose").Types.ObjectId)();

    const res = await request(app)
      .post("/api/v1/deals")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Bad Deal", contact: fakeContactId });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/Invalid contact/i);
  });
});

// ══════════════════════════════════════════════════════
// GET /api/v1/deals/:id  (get one)
// ══════════════════════════════════════════════════════
describe("GET /api/v1/deals/:id", () => {
  test("should return a specific deal", async () => {
    const { token, contactId } = await setupUserAndContact();

    const createRes = await request(app)
      .post("/api/v1/deals")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "My Deal", value: 3000, contact: contactId });

    const dealId = createRes.body.data.deal._id;

    const res = await request(app)
      .get(`/api/v1/deals/${dealId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.deal.title).toBe("My Deal");
  });

  test("should return 404 for non-existent deal", async () => {
    const { token } = await setupUserAndContact();
    const fakeId = new (require("mongoose").Types.ObjectId)();

    const res = await request(app)
      .get(`/api/v1/deals/${fakeId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
  });
});

// ══════════════════════════════════════════════════════
// PATCH /api/v1/deals/:id  (update)
// ══════════════════════════════════════════════════════
describe("PATCH /api/v1/deals/:id", () => {
  test("should update deal title and value", async () => {
    const { token, contactId } = await setupUserAndContact();

    const createRes = await request(app)
      .post("/api/v1/deals")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Old Title", value: 1000, contact: contactId });

    const dealId = createRes.body.data.deal._id;

    const res = await request(app)
      .patch(`/api/v1/deals/${dealId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "New Title", value: 9999 });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.deal.title).toBe("New Title");
    expect(res.body.data.deal.value).toBe(9999);
  });

  test("should NOT allow updating stage via PATCH (security)", async () => {
    const { token, contactId } = await setupUserAndContact();

    const createRes = await request(app)
      .post("/api/v1/deals")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Stage Test", contact: contactId });

    const dealId = createRes.body.data.deal._id;

    const res = await request(app)
      .patch(`/api/v1/deals/${dealId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ stage: "won" });

    // Stage should still be "lead" (default) since updateDeal deletes req.body.stage
    expect(res.body.data.deal.stage).toBe("lead");
  });
});

// ══════════════════════════════════════════════════════
// PATCH /api/v1/deals/:id/stage  (change stage)
// ══════════════════════════════════════════════════════
describe("PATCH /api/v1/deals/:id/stage", () => {
  test("should change deal stage to 'qualified'", async () => {
    const { token, contactId } = await setupUserAndContact();

    const createRes = await request(app)
      .post("/api/v1/deals")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Pipeline Deal", contact: contactId });

    const dealId = createRes.body.data.deal._id;

    const res = await request(app)
      .patch(`/api/v1/deals/${dealId}/stage`)
      .set("Authorization", `Bearer ${token}`)
      .send({ stage: "qualified" });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.deal.stage).toBe("qualified");
  });

  test("should set closedAt when stage is 'won'", async () => {
    const { token, contactId } = await setupUserAndContact();

    const createRes = await request(app)
      .post("/api/v1/deals")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Won Deal", contact: contactId });

    const dealId = createRes.body.data.deal._id;

    const res = await request(app)
      .patch(`/api/v1/deals/${dealId}/stage`)
      .set("Authorization", `Bearer ${token}`)
      .send({ stage: "won" });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.deal.stage).toBe("won");
    expect(res.body.data.deal.closedAt).toBeDefined();
  });

  test("should reject invalid stage value", async () => {
    const { token, contactId } = await setupUserAndContact();

    const createRes = await request(app)
      .post("/api/v1/deals")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Invalid Stage", contact: contactId });

    const dealId = createRes.body.data.deal._id;

    const res = await request(app)
      .patch(`/api/v1/deals/${dealId}/stage`)
      .set("Authorization", `Bearer ${token}`)
      .send({ stage: "invalid_stage" });

    expect(res.statusCode).toBe(400);
  });
});

// ══════════════════════════════════════════════════════
// DELETE /api/v1/deals/:id
// ══════════════════════════════════════════════════════
describe("DELETE /api/v1/deals/:id", () => {
  test("should delete a deal (owner role)", async () => {
    const { token, contactId } = await setupUserAndContact();

    const createRes = await request(app)
      .post("/api/v1/deals")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "To Delete", contact: contactId });

    const dealId = createRes.body.data.deal._id;

    const res = await request(app)
      .delete(`/api/v1/deals/${dealId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(204);

    // Verify it's gone
    const getRes = await request(app)
      .get(`/api/v1/deals/${dealId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(getRes.statusCode).toBe(404);
  });
});
