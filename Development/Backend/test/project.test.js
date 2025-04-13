const request = require("supertest");
const app = require("../app");
const prisma = require("../utils/prisma");

describe("GET /project", () => {
  let token;

  beforeAll(async () => {
    const loginRes = await request(app).post("/api/user/login").send({
      email: "test@gmail.com",
      password: "123",
    });

    token = loginRes.body.token;
  });

  //checking token
  it("should return 200 when token is valid", async () => {
    const res = await request(app)
      .get("/api/project")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
  });

  //testing missing value
  it("should return 401 when token is missing", async () => {
    const res = await request(app).get("/api/project");
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("error", "Access Denied");
  });

  it("should return 401 when token is invalid", async () => {
    const res = await request(app)
      .get("/api/project")
      .set("Authorization", `Bearer faketoken123`);

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("error", "Invalid Token");
  });
});

describe("POST /api/project/create", () => {
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

  // ✅ Success Case
  // it("should create project with 201 status", async () => {
  //   const res = await request(app)
  //     .post("/api/project/create")
  //     .set("Authorization", `Bearer ${token}`)
  //     .send(validPayload);

  //   expect(res.statusCode).toBe(201);
  //   expect(res.body).toHaveProperty("message", "Project created successfully");
  //   expect(res.body.result).toHaveProperty("newProject");
  //   expect(res.body.result).toHaveProperty("newBudget");
  // });

  // Missing fields
  it("should return 400 if required fields are missing", async () => {
    const { projectName, ...partialPayload } = validPayload;

    const res = await request(app)
      .post("/api/project/create")
      .set("Authorization", `Bearer ${token}`)
      .send(partialPayload);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message", "All fields are required");
  });

  // Invalid date format
  it("should return 400 if dates are invalid", async () => {
    const res = await request(app)
      .post("/api/project/create")
      .set("Authorization", `Bearer ${token}`)
      .send({ ...validPayload, startDate: "invalid-date" });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message", "Invalid date format");
  });

  // Invalid budgetAmount (not a number)
  it("should return 400 if budgetAmount is not a number", async () => {
    const res = await request(app)
      .post("/api/project/create")
      .set("Authorization", `Bearer ${token}`)
      .send({ ...validPayload, budgetAmount: "abc" });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message", "Invalid project value");
  });

  // Duplicate project name
  it("should return 400 if project name already exists", async () => {
    // First create the project
    await request(app)
      .post("/api/project/create")
      .set("Authorization", `Bearer ${token}`)
      .send(validPayload);

    // Try again with the same name
    const res = await request(app)
      .post("/api/project/create")
      .set("Authorization", `Bearer ${token}`)
      .send(validPayload);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message", "Project already exists!");
  });

  // Invalid role (not builder)
  it("should return 403 if user is not builder", async () => {
    // Login as non-builder
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

  // No token
  it("should return 401 if no token is provided", async () => {
    const res = await request(app)
      .post("/api/project/create")
      .send(validPayload);

    expect(res.statusCode).toBe(401);
  });

  // Invalid token
  it("should return 401 if token is invalid", async () => {
    const res = await request(app)
      .post("/api/project/create")
      .set("Authorization", "Bearer faketoken123")
      .send(validPayload);

    expect(res.statusCode).toBe(401);
  });
});

//test of product by id
describe("Test of Project by ID", () => {
  // ✅ Valid project ID
  it("should return success and project data when valid project ID is provided", async () => {
    const res = await request(app)
      .get("/api/user/singleProject")
      .query({ projectId: 123 });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("project");
    expect(res.body.project).toHaveProperty("id", projectId);
  });

  // Missing project ID
  it("should return error when project ID is not provided", async () => {
    const res = await request(app).get("/api/user/project");

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message", "Project id is required");
  });

  // Invalid project ID (not in DB)
  it("should return error when project is not found", async () => {
    const res = await request(app)
      .get("/api/user/project")
      .query({ projectId: 123 });

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("message", "Project not found");
  });
});
