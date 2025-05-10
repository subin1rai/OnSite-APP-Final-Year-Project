const request = require("supertest");
const app = require("../app");
const prisma = require("../utils/prisma");
const cloudinary = require("cloudinary").v2;
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");

// ✅ Mock cloudinary
jest.mock("cloudinary", () => ({
  v2: {
    config: jest.fn(),
    uploader: {
      upload_stream: jest.fn((options, callback) => {
        return {
          write: () => callback(null, { secure_url: "https://dummycloudinary.com/model.jpg" }),
          end: jest.fn(),
        };
      }),
    },
  },
}));

// describe("POST /api/upload3dmodel", () => {
//   let token;
//   let createdProjectId;
//   const modelFilePath = path.join(__dirname, "mock_model.glb");

//   beforeAll(async () => {
//     const email = "test@gmail.com";
//     const password = "Subin@1rai";

//     if (!fs.existsSync(modelFilePath)) {
//       fs.writeFileSync(modelFilePath, "dummy 3D model content");
//     }

//     let user = await prisma.user.findUnique({ where: { email } });
//     if (!user) {
//       user = await prisma.user.create({
//         data: {
//           name: "Test Builder",
//           email,
//           password: await bcrypt.hash(password, 10),
//           role: "builder",
//           tc: true,
//         },
//       });
//     }

//     const loginRes = await request(app).post("/api/user/login").send({ email, password });
//     token = loginRes.body.token;

//     const projectRes = await request(app)
//       .post("/api/project/create")
//       .set("Authorization", `Bearer ${token}`)
//       .send({
//         projectName: "Model Project",
//         ownerName: "Builder",
//         budgetAmount: 10000,
//         location: "Birgunj",
//         startDate: "2025-05-01",
//         endDate: "2025-06-01",
//       });
//     createdProjectId = projectRes.body.result?.newProject?.id;
//   });

//   afterAll(async () => {
//     if (createdProjectId) {
//       await prisma.threeDModel.deleteMany({ where: { projectId: createdProjectId } });
//       await prisma.budget.deleteMany({ where: { projectId: createdProjectId } });
//       await prisma.project.delete({ where: { id: createdProjectId } });
//     }
//   });

//   it("should upload a model and return 201", async () => {
//     const res = await request(app)
//       .post("/api/upload3dmodel")
//       .set("Authorization", `Bearer ${token}`)
//       .field("projectId", createdProjectId)
//       .field("modelName", "Model 1")
//       .field("modelUrl", "https://my.spline.design/untitled-d32c30132a46d592f904f89d9cddae0d/")
//       .attach("image", modelFilePath);

//     expect(res.statusCode).toBe(201);
//     expect(res.body).toHaveProperty("message", "Model created successfully");
//     expect(res.body.model).toHaveProperty("modelName", "Model 1");
//     expect(res.body.model).toHaveProperty("image");
//   });

//   it("should return 400 if fields are missing", async () => {
//     const res = await request(app)
//       .post("/api/upload3dmodel")
//       .set("Authorization", `Bearer ${token}`)
//       .send({});

//     expect(res.statusCode).toBe(400);
//     expect(res.body.message).toBe("All fields are required, including a file upload");
//   });
// });

describe("POST /api/all3dModel", () => {
  let token;
  let createdProjectId;
  let createdModelId;
  const modelFilePath = path.join(__dirname, "mock_model.glb");

  beforeAll(async () => {
    const email = "test@gmail.com";
    const password = "Subin@1rai";

    if (!fs.existsSync(modelFilePath)) {
      fs.writeFileSync(modelFilePath, "dummy 3D model content");
    }

    const loginRes = await request(app).post("/api/user/login").send({ email, password });
    token = loginRes.body.token;

    const projectRes = await request(app)
      .post("/api/project/create")
      .set("Authorization", `Bearer ${token}`)
      .send({
        projectName: "Model Project All",
        ownerName: "Builder",
        budgetAmount: 10000,
        location: "Butwal",
        startDate: "2025-06-01",
        endDate: "2025-07-01",
      });

    createdProjectId = projectRes.body.result.newProject.id;

    const model = await prisma.threeDModel.create({
      data: {
        modelName: "Test Model",
        modelUrl: "https://my.spline.design/untitled-d32c30132a46d592f904f89d9cddae0d/",
        image: "https://dummycloudinary.com/testmodel.jpg",
        projectId: createdProjectId,
        userId: loginRes.body.user?.id || 1,
      },
    });

    createdModelId = model.id;
  });

  afterAll(async () => {
    if (createdModelId) {
      await prisma.threeDModel.delete({ where: { id: createdModelId } });
    }
    if (createdProjectId) {
      await prisma.budget.deleteMany({ where: { projectId: createdProjectId } });
      await prisma.project.delete({ where: { id: createdProjectId } });
    }
    await prisma.$disconnect();
  });

  it("should return all models for a valid projectId", async () => {
    const res = await request(app)
      .post("/api/all3dModel")
      .set("Authorization", `Bearer ${token}`)
      .send({ projectId: createdProjectId });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "All models retrieved successfully");
    expect(res.body.models.length).toBeGreaterThan(0);
    expect(res.body.models[0]).toHaveProperty("modelName");
  });

  it("should return 400 if projectId is missing", async () => {
    const res = await request(app)
      .post("/api/all3dModel")
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message", "Project ID is required");
  });

  it("should return 401 if no token is provided", async () => {
    const res = await request(app).post("/api/all3dModel").send({ projectId: createdProjectId });

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("error");
  });
});
