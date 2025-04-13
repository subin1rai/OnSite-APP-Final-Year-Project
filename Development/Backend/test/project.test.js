const request = require("supertest");
const app = require("../app");
const prisma = require("../utils/prisma");

describe("Project Details", () => {
  let token;

  beforeAll(async () => {
    const loginRes = await request(app).post("/api/user/login").send({
      email: "test@gmail.com",
      password: "123",
    });

    token = loginRes.body.token;
  });

  it("returns project list when token is valid", async () => {
    const res = await request(app)
      .get("/api/project")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
  });

  it("returns error when token is missing", async () => {
    const res = await request(app).get("/api/project");

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("error", "Access Denied");
  });

  it("returns error when token is invalid", async () => {
    const res = await request(app)
      .get("/api/project")
      .set("Authorization", "Bearer faketoken123");

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("error", "Invalid Token");
  });
});

describe("Create Project", () => {
  let token;

  beforeAll(async () => {
    const loginRes = await request(app).post("/api/user/login").send({
      email: "test@gmail.com",
      password: "123",
    });

    token = loginRes.body.token;
  });

  const validPayload = {
    projectName: "Test Project",
    ownerName: "John Doe",
    budgetAmount: 50000,
    location: "Kathmandu",
    startDate: "2025-05-01",
    endDate: "2025-06-01",
  };

  it("creates project successfully", async () => {
    const res = await request(app)
      .post("/api/project/create")
      .set("Authorization", `Bearer ${token}`)
      .send(validPayload);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("message", "Project created successfully");
    expect(res.body.result).toHaveProperty("newProject");
    expect(res.body.result).toHaveProperty("newBudget");
  });

  it("returns error if required fields are missing", async () => {
    const { projectName, ...partialPayload } = validPayload;

    const res = await request(app)
      .post("/api/project/create")
      .set("Authorization", `Bearer ${token}`)
      .send(partialPayload);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message", "All fields are required");
  });

  it("returns error for invalid date format", async () => {
    const res = await request(app)
      .post("/api/project/create")
      .set("Authorization", `Bearer ${token}`)
      .send({ ...validPayload, startDate: "invalid-date" });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message", "Invalid date format");
  });

  it("returns error if budgetAmount is not a number", async () => {
    const res = await request(app)
      .post("/api/project/create")
      .set("Authorization", `Bearer ${token}`)
      .send({ ...validPayload, budgetAmount: "abc" });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message", "Invalid project value");
  });

  it("returns error if project name already exists", async () => {
    await request(app)
      .post("/api/project/create")
      .set("Authorization", `Bearer ${token}`)
      .send(validPayload);

    const res = await request(app)
      .post("/api/project/create")
      .set("Authorization", `Bearer ${token}`)
      .send(validPayload);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message", "Project already exists!");
  });

  it("returns error if user is not builder", async () => {
    const loginRes = await request(app).post("/api/user/login").send({
      email: "sujal@gmail.com",
      password: "123",
    });

    const fakeToken = loginRes.body.token;

    const res = await request(app)
      .post("/api/project/create")
      .set("Authorization", `Bearer ${fakeToken}`)
      .send(validPayload);

    expect(res.statusCode).toBe(403);
    expect(res.body).toHaveProperty("message", "User not valid!");
  });

  it("returns error if no token is provided", async () => {
    const res = await request(app)
      .post("/api/project/create")
      .send(validPayload);

    expect(res.statusCode).toBe(401);
  });

  it("returns error if token is invalid", async () => {
    const res = await request(app)
      .post("/api/project/create")
      .set("Authorization", "Bearer faketoken123")
      .send(validPayload);

    expect(res.statusCode).toBe(401);
  });
});

describe("Project by ID", () => {
  it("returns project data for valid ID", async () => {
    const res = await request(app)
      .post("/api/singleProject")
      .query({ id: 1 });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("project");
  });

  it("returns error if project ID is missing", async () => {
    const res = await request(app).post("/api/singleProject");

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message", "Project id is required");
  });

  it("returns error if project is not found", async () => {
    const res = await request(app)
      .post("/api/singleProject")
      .query({ id: 9999 });

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("message", "Project not found");
  });
});
