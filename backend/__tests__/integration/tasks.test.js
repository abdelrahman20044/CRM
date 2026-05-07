const request = require("supertest");
const { connectTestDB, disconnectTestDB } = require("../setup");

jest.mock("../../src/config/db", () => jest.fn().mockResolvedValue());

const app = require("../../src/app");
const User = require("../../src/models/User");
const Company = require("../../src/models/Company");
const Task = require("../../src/models/Task");

// ── Connect/Disconnect ──
beforeAll(async () => {
  await connectTestDB();
});

afterAll(async () => {
  await disconnectTestDB();
});

// ── Helper: register user and return token ──
const createUserAndGetToken = async () => {
  const res = await request(app)
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

  return res.body.token;
};

// ── Clean all collections before each test ──
beforeEach(async () => {
  await User.deleteMany({});
  await Company.deleteMany({});
  await Task.deleteMany({});
});

// ══════════════════════════════════════════════════════
// GET /api/v1/tasks  (list all)
// ══════════════════════════════════════════════════════
describe("GET /api/v1/tasks", () => {
  test("should return 401 without auth token", async () => {
    const res = await request(app).get("/api/v1/tasks");
    expect(res.statusCode).toBe(401);
  });

  test("should return empty tasks array for new user", async () => {
    const token = await createUserAndGetToken();

    const res = await request(app)
      .get("/api/v1/tasks")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.tasks).toEqual([]);
    expect(res.body.results).toBe(0);
  });
});

// ══════════════════════════════════════════════════════
// POST /api/v1/tasks  (create)
// ══════════════════════════════════════════════════════
describe("POST /api/v1/tasks", () => {
  test("should create a task with auto-assigned company and user", async () => {
    const token = await createUserAndGetToken();

    const res = await request(app)
      .post("/api/v1/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Follow up with client",
        description: "Call them about the proposal",
        priority: "high",
        dueDate: "2026-05-01",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.task.title).toBe("Follow up with client");
    expect(res.body.data.task.priority).toBe("high");
    expect(res.body.data.task.status).toBe("pending"); // default
    expect(res.body.data.task.company).toBeDefined();
    expect(res.body.data.task.assignedTo).toBeDefined();
    expect(res.body.data.task.createdBy).toBeDefined();
  });

  test("should fail without required title", async () => {
    const token = await createUserAndGetToken();

    const res = await request(app)
      .post("/api/v1/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ description: "No title provided" });

    expect(res.statusCode).not.toBe(201);
  });
});

// ══════════════════════════════════════════════════════
// GET /api/v1/tasks/:id  (get one)
// ══════════════════════════════════════════════════════
describe("GET /api/v1/tasks/:id", () => {
  test("should return a specific task", async () => {
    const token = await createUserAndGetToken();

    const createRes = await request(app)
      .post("/api/v1/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "My Task" });

    const taskId = createRes.body.data.task._id;

    const res = await request(app)
      .get(`/api/v1/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.task.title).toBe("My Task");
  });

  test("should return 404 for non-existent task", async () => {
    const token = await createUserAndGetToken();
    const fakeId = new (require("mongoose").Types.ObjectId)();

    const res = await request(app)
      .get(`/api/v1/tasks/${fakeId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
  });
});

// ══════════════════════════════════════════════════════
// PATCH /api/v1/tasks/:id  (update)
// ══════════════════════════════════════════════════════
describe("PATCH /api/v1/tasks/:id", () => {
  test("should update task title and priority", async () => {
    const token = await createUserAndGetToken();

    const createRes = await request(app)
      .post("/api/v1/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Old Title", priority: "low" });

    const taskId = createRes.body.data.task._id;

    const res = await request(app)
      .patch(`/api/v1/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Updated Title", priority: "urgent" });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.task.title).toBe("Updated Title");
    expect(res.body.data.task.priority).toBe("urgent");
  });

  test("should NOT allow updating company field (security)", async () => {
    const token = await createUserAndGetToken();

    const createRes = await request(app)
      .post("/api/v1/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Security Test" });

    const taskId = createRes.body.data.task._id;
    const originalCompany = createRes.body.data.task.company._id || createRes.body.data.task.company;

    const res = await request(app)
      .patch(`/api/v1/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ company: "hacked_company_id" });

    const updatedCompany = res.body.data.task.company._id || res.body.data.task.company;
    expect(updatedCompany).toBe(originalCompany);
  });
});

// ══════════════════════════════════════════════════════
// PATCH /api/v1/tasks/:id/status  (change status)
// ══════════════════════════════════════════════════════
describe("PATCH /api/v1/tasks/:id/status", () => {
  test("should change task status to 'in-progress'", async () => {
    const token = await createUserAndGetToken();

    const createRes = await request(app)
      .post("/api/v1/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Status Test" });

    const taskId = createRes.body.data.task._id;

    const res = await request(app)
      .patch(`/api/v1/tasks/${taskId}/status`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "in-progress" });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.task.status).toBe("in-progress");
  });

  test("should set completedAt when status is 'completed'", async () => {
    const token = await createUserAndGetToken();

    const createRes = await request(app)
      .post("/api/v1/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Complete Me" });

    const taskId = createRes.body.data.task._id;

    const res = await request(app)
      .patch(`/api/v1/tasks/${taskId}/status`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "completed" });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.task.status).toBe("completed");
    expect(res.body.data.task.completedAt).toBeDefined();
  });

  test("should reject invalid status value", async () => {
    const token = await createUserAndGetToken();

    const createRes = await request(app)
      .post("/api/v1/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Invalid Status" });

    const taskId = createRes.body.data.task._id;

    const res = await request(app)
      .patch(`/api/v1/tasks/${taskId}/status`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "invalid_status" });

    expect(res.statusCode).toBe(400);
  });
});

// ══════════════════════════════════════════════════════
// DELETE /api/v1/tasks/:id
// ══════════════════════════════════════════════════════
describe("DELETE /api/v1/tasks/:id", () => {
  test("should delete a task (owner role)", async () => {
    const token = await createUserAndGetToken();

    const createRes = await request(app)
      .post("/api/v1/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "To Delete" });

    const taskId = createRes.body.data.task._id;

    const res = await request(app)
      .delete(`/api/v1/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(204);

    // Verify it's gone
    const getRes = await request(app)
      .get(`/api/v1/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(getRes.statusCode).toBe(404);
  });
});
