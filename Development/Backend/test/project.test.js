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
  let createdProjectId;

  beforeAll(async () => {
    const loginRes = await request(app).post("/api/user/login").send({
      email: "test@gmail.com",
      password: "123",
    });

    token = loginRes.body.token;
  });

  const validPayload = {
    projectName: "Test Project2",
    ownerName: "test",
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

    createdProjectId = res.body.result.newProject.id;
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

  afterAll(async () => {
    try {
      if (createdProjectId) {
        await prisma.project.delete({
          where: { id: createdProjectId },
        });
      }
    } catch (err) {
      console.warn("Project cleanup failed:", err.message);
    }
  });
});

describe("Project by ID", () => {
  it("returns project data for valid ID", async () => {
    const res = await request(app).post("/api/singleProject").query({ id: 1 });

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

describe("PUT /api/projectDelete", () => {
  let builderToken;
  let createdProjectId;

  beforeAll(async () => {
    const builderLogin = await request(app).post("/api/user/login").send({
      email: "test@gmail.com",
      password: "123",
    });
    builderToken = builderLogin.body.token;

    // Create a project to delete
    const res = await request(app)
      .post("/api/project/create")
      .set("Authorization", `Bearer ${builderToken}`)
      .send({
        projectName: "Project To Delete",
        ownerName: "Builder",
        budgetAmount: 15000,
        location: "Bhaktapur",
        startDate: "2025-06-01",
        endDate: "2025-07-01",
      });

    createdProjectId = res.body.result.newProject.id;
  });

  it("should soft delete the project with valid ID", async () => {
    const res = await request(app)
      .put("/api/projectDelete")
      .set("Authorization", `Bearer ${builderToken}`)
      .send({ projectId: createdProjectId });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty(
      "message",
      "Project deleted successfully !"
    );

    // Verify it's now invisible
    const check = await prisma.project.findUnique({
      where: { id: createdProjectId },
    });

    expect(check.isVisible).toBe(false);
  });

  it("should return 400 if projectId is missing", async () => {
    const res = await request(app)
      .put("/api/projectDelete")
      .set("Authorization", `Bearer ${builderToken}`)
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error", "Project Id not found");
  });

  it("should return 400 if project is already deleted or not found", async () => {
    const res = await request(app)
      .put("/api/projectDelete")
      .set("Authorization", `Bearer ${builderToken}`)
      .send({ projectId: createdProjectId });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error", "Project data not found");
  });

  afterAll(async () => {
    await prisma.project.deleteMany({
      where: { id: createdProjectId },
    });
  });
});



describe("POST /api/project/addWorker", () => {
  let builderToken;
  let createdProjectId;
  let createdWorkerId;

  beforeAll(async () => {
    // Login as builder
    const loginRes = await request(app).post("/api/user/login").send({
      email: "test@gmail.com",
      password: "123",
    });
    builderToken = loginRes.body.token;

    // Create test project
    const projectRes = await request(app)
      .post("/api/project/create")
      .set("Authorization", `Bearer ${builderToken}`)
      .send({
        projectName: "Worker Test Project",
        ownerName: "Builder",
        budgetAmount: 25000,
        location: "Pokhara",
        startDate: "2025-07-01",
        endDate: "2025-08-01",
      });

    createdProjectId = projectRes.body.result.newProject.id;

    createdWorkerId = 1;
  });

  it("should successfully add worker to project", async () => {
    const res = await request(app)
      .post("/api/project/addWorker")
      .set("Authorization", `Bearer ${builderToken}`)
      .send({
        projectId: createdProjectId,
        workerId: createdWorkerId,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("projectId", createdProjectId);
    expect(res.body).toHaveProperty("workerId", createdWorkerId);
  });

  it("should return 500 if workerId or projectId is missing", async () => {
    const res = await request(app)
      .post("/api/project/addWorker")
      .set("Authorization", `Bearer ${builderToken}`)
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message", "");
  });

  it("should return 500 for invalid IDs", async () => {
    const res = await request(app)
      .post("/api/project/addWorker")
      .set("Authorization", `Bearer ${builderToken}`)
      .send({
        projectId: 999999,
        workerId: 999999,
      });

    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty("error", "Internal Server error");
  });

  afterAll(async () => {
    await prisma.projectWorker.deleteMany({
      where: {
        projectId: createdProjectId,
        workerId: createdWorkerId,
      },
    });

    await prisma.project.deleteMany({
      where: { id: createdProjectId },
    });
  });
});
