const request = require("supertest");
const app = require("../app");
const prisma = require("../utils/prisma");

describe("Get the details of the budget", () => {
    let builderToken;
    let createdProjectId;
    let createdBudgetId;
    let createdTransactionId;

    beforeAll(async () => {
        // Login
        const loginRes = await request(app).post("/api/user/login").send({
          email: "test@gmail.com",
          password: "123",
        });
        builderToken = loginRes.body.token;

        // Create a project
        const projectRes = await request(app)
          .post("/api/project/create")
          .set("Authorization", `Bearer ${builderToken}`)
          .send({
            projectName: "Budget Test Project",
            ownerName: "Builder",
            budgetAmount: 20000,
            location: "Nepalgunj",
            startDate: "2025-07-01",
            endDate: "2025-08-01",
          });

        console.log("Project creation response:", projectRes.body);

        createdProjectId = projectRes.body.result.newProject.id;

        // Create a budget
        const budget = await prisma.budget.findFirst({
          where:{
            projectId: createdProjectId
          }
        });
        createdBudgetId = budget.id;

        // Create a transaction
        const transaction = await prisma.transaction.create({
          data: {
            budgetId: createdBudgetId,
            amount: 8000,
            type: "Debit",
            category: "Material",
            note: "Steel rod advance",
          },
        });
        createdTransactionId = transaction.id;
      });

    it("should return budgets and transactions when valid project id", async () => {
      const res = await request(app)
        .get(`/api/project/${createdProjectId}/budget`)
        .set("Authorization", `Bearer ${builderToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("id", createdProjectId);
      expect(res.body).toHaveProperty("budgets");
      expect(res.body.budgets[0].Transaction[0]).toHaveProperty("amount", 8000);
    });

    it("should return 404 for non-existent project", async () => {
      const res = await request(app)
        .get("/api/project/999999/budget")
        .set("Authorization", `Bearer ${builderToken}`);

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("message", "Project not found");
    });

    it("should return 500 for invalid project ID (non-numeric)", async () => {
      const res = await request(app)
        .get("/api/project/invalid/budget")
        .set("Authorization", `Bearer ${builderToken}`);

      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty(
        "error",
        "An error occurred while fetching the project budget."
      );
    });

    afterAll(async () => {
      await prisma.transaction.deleteMany({
        where: { id: createdTransactionId },
      });

      await prisma.budget.deleteMany({
        where: { id: createdBudgetId },
      });

      if (createdProjectId) {
        await prisma.project.delete({
          where: { id: createdProjectId },
        });
      }

    });
  });

describe("Testing to add the transaction", () => {
  let token;
  let user;
  let createdBudgetId;

  beforeAll(async () => {
    const loginRes = await request(app).post("/api/user/login").send({
      email: "test@gmail.com",
      password: "Subin@1rai",
    });

    token = loginRes.body.token;

    const projectRes = await request(app)
      .post("/api/project/create")
      .set("Authorization", `Bearer ${token}`)
      .send({
        projectName: "Budget Test Project",
        ownerName: "Builder",
        budgetAmount: 20000,
        location: "Nepalgunj",
        startDate: "2025-07-01",
        endDate: "2025-08-01",
      });

    createdProjectId = projectRes.body.result.newProject.id;

    const budget = await prisma.budget.findFirst({
      where: { projectId: createdProjectId },
    });

    createdBudgetId = budget.id;

    user = await prisma.user.findUnique({ where: { email: "test@gmail.com" } });
    if (!user) throw new Error("User not found in DB");
  });

  afterAll(async () => {
    if (createdBudgetId) {
      await prisma.transaction.deleteMany({
        where: { budgetId: createdBudgetId },
      });
    }

    if (user?.id) {
      await prisma.notification.deleteMany({ where: { userId: user.id } });
    }

    if (createdBudgetId) {
      await prisma.budget.deleteMany({ where: { id: createdBudgetId } });
      await prisma.project.deleteMany({ where: { id:  createdProjectId  } });
    }

    await prisma.$disconnect();
  });

  it("should return 400 if required fields are missing", async () => {
    const res = await request(app)
      .post("/api/budget/add-transaction")
      .set("Authorization", `Bearer ${token}`)
      .send({ amount: 100 });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("Missing required fields");
  });

  it("should return 500 if budget not found", async () => {
    const res = await request(app)
      .post("/api/budget/add-transaction")
      .set("Authorization", `Bearer ${token}`)
      .send({
        budgetId: 9999,
        amount: 100,
        type: "Credit",
      });

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe(
      "An error occurred while processing the transaction."
    );
  });

  it("should add a transaction and update budget", async () => {
    const res = await request(app)
      .post("/api/budget/add-transaction")
      .set("Authorization", `Bearer ${token}`)
      .send({
        budgetId: createdBudgetId,
        amount: 200,
        type: "Debit",
        note: "Bought materials",
        category: "Materials",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Transaction added successfully");
    expect(res.body.notification.message).toContain(
      "transaction of amount 200"
    );
  });
});

describe("Testing to get the all transaction", () => {
  let token;
  let user;
  let createdProjectId;
  let createdBudgetId;
  let createdTransactionId;

  beforeAll(async () => {
    // Login
    const loginRes = await request(app).post("/api/user/login").send({
      email: "test@gmail.com",
      password: "Subin@1rai",
    });

    token = loginRes.body.token;

    // Create project
    const projectRes = await request(app)
      .post("/api/project/create")
      .set("Authorization", `Bearer ${token}`)
      .send({
        projectName: "Transaction Project",
        ownerName: "Builder",
        budgetAmount: 15000,
        location: "Lalitpur",
        startDate: "2025-06-01",
        endDate: "2025-07-01",
      });

    createdProjectId = projectRes.body.result.newProject.id;

    // Get created budget
    const budget = await prisma.budget.findFirst({
      where: { projectId: createdProjectId },
    });

    createdBudgetId = budget.id;

    // Create transaction
    const transaction = await prisma.transaction.create({
      data: {
        budgetId: createdBudgetId,
        amount: 1000,
        type: "Debit",
        category: "Material",
        note: "Bought tools",
      },
    });

    createdTransactionId = transaction.id;

    user = await prisma.user.findUnique({ where: { email: "test@gmail.com" } });
    if (!user) throw new Error("User not found");
  });

  afterAll(async () => {
    await prisma.transaction.deleteMany({
      where: { id: createdTransactionId },
    });
    await prisma.budget.deleteMany({ where: { id: createdBudgetId } });
    await prisma.project.delete({ where: { id: createdProjectId } });
  });

  it("should return all transactions for a valid budget", async () => {
    const res = await request(app)
      .post("/api/budget/transaction")
      .set("Authorization", `Bearer ${token}`)
      .send({
        budgetId: createdBudgetId,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("transactions");
    expect(res.body.transactions).toHaveProperty("Transaction");
    expect(res.body.transactions.Transaction.length).toBeGreaterThan(0);
    expect(res.body.transactions.Transaction[0]).toHaveProperty("amount", 1000);
  });

  it("should return 500 if budgetId is missing", async () => {
    const res = await request(app)
      .post("/api/budget/transaction")
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty("error", "Internal Server Error!");
  });
});


