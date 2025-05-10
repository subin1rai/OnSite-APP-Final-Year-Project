
  const request = require("supertest");
  const path = require("path");
  const fs = require("fs");
  const app = require("../app");
  const prisma = require("../utils/prisma");
  
  const mockFilePath = path.join(__dirname, "mock_doc.pdf");
  
//   describe("Test of Uplaod document", () => {
//     let token;
//     let createdProjectId;
  
//     beforeAll(async () => {
//       const email = "test@gmail.com";
//       const password = "Subin@1rai";
  
//       if (!fs.existsSync(mockFilePath)) {
//         fs.writeFileSync(mockFilePath, "Dummy document content");
//       }
  
//       const loginRes = await request(app).post("/api/user/login").send({ email, password });
//       token = loginRes.body.token;
  
//       const projectRes = await request(app)
//         .post("/api/project/create")
//         .set("Authorization", `Bearer ${token}`)
//         .send({
//           projectName: "Document Project",
//           ownerName: "Builder",
//           budgetAmount: 50000,
//           location: "Lalitpur",
//           startDate: "2025-05-01",
//           endDate: "2025-06-01",
//         });
  
//       createdProjectId = projectRes.body.result?.newProject?.id;
//     });
  
//     afterAll(async () => {
//       if (createdProjectId) {
//         await prisma.documentFiles.deleteMany({ where: { projectId: createdProjectId } });
//         await prisma.budget.deleteMany({ where: { projectId: createdProjectId } });
//         await prisma.project.delete({ where: { id: createdProjectId } });
//       }
//       await prisma.$disconnect();
//     });
  
//     it("should upload document and return 200", async () => {
//       const res = await request(app)
//         .post("/api/document/upload")
//         .set("Authorization", `Bearer ${token}`)
//         .field("projectId", createdProjectId)
//         .attach("files", mockFilePath);
  
//       expect(res.statusCode).toBe(200);
//       expect(res.body).toHaveProperty("message", "Document(s) uploaded successfully");
//       expect(res.body.data.length).toBeGreaterThan(0);
//       expect(res.body.data[0]).toHaveProperty("file");
//     });
  
//     it("should return 200 and empty data array when no files provided", async () => {
//       const res = await request(app)
//         .post("/api/document/upload")
//         .set("Authorization", `Bearer ${token}`)
//         .field("projectId", createdProjectId);
  
//       expect(res.statusCode).toBe(200);
//       expect(res.body.data).toEqual([]);
//     });
  
//     it("should return 500 if no projectId is passed", async () => {
//       const res = await request(app)
//         .post("/api/document/upload")
//         .set("Authorization", `Bearer ${token}`)
//         .attach("files", mockFilePath);
  
//       expect(res.statusCode).toBe(500);
//       expect(res.body).toHaveProperty("message", "An error occurred during upload");
//     });
//   });
  

//   describe("Test to get all document", () => {
//     let token;
//     let createdProjectId;
//     let createdDocumentId;
  
//     const dummyDocPath = path.join(__dirname, "mock_document.pdf");
  
//     beforeAll(async () => {
//       const email = "test@gmail.com";
//       const password = "Subin@1rai";
  
//       if (!fs.existsSync(dummyDocPath)) {
//         fs.writeFileSync(dummyDocPath, "Dummy PDF content");
//       }
  
//       // Login
//       const loginRes = await request(app).post("/api/user/login").send({ email, password });
//       token = loginRes.body.token;
  
//       // Create a project
//       const projectRes = await request(app)
//         .post("/api/project/create")
//         .set("Authorization", `Bearer ${token}`)
//         .send({
//           projectName: "Document Test Project",
//           ownerName: "Builder",
//           budgetAmount: 50000,
//           location: "Pokhara",
//           startDate: "2025-05-01",
//           endDate: "2025-06-01",
//         });
  
//       createdProjectId = projectRes.body.result.newProject.id;
  
//       const document = await prisma.documentFiles.create({
//         data: {
//           name: "TestDocument.pdf",
//           file: "https://dummycloudinary.com/fake_document.pdf",
//           projectId: createdProjectId,
//           isVisible: true,
//         },
//       });
  
//       createdDocumentId = document.id;
//     });
  
//     afterAll(async () => {
//       if (createdDocumentId) {
//         await prisma.documentFiles.delete({ where: { id: createdDocumentId } });
//       }
//       if (createdProjectId) {
//         await prisma.budget.deleteMany({ where: { projectId: createdProjectId } });
//         await prisma.project.delete({ where: { id: createdProjectId } });
//       }
//       await prisma.$disconnect();
//     });
  

//     it("should return documents for a valid projectId", async () => {
//       const res = await request(app)
//         .post("/api/allDocument")
//         .set("Authorization", `Bearer ${token}`)
//         .send({ projectId: createdProjectId });
  
//       expect(res.statusCode).toBe(200);
//       expect(res.body.success).toBe(true);
//       expect(res.body.data.length).toBeGreaterThan(0);
//       expect(res.body.data[0]).toHaveProperty("name", "TestDocument.pdf");
//     });
  
//     it("should return 400 if projectId is missing", async () => {
//       const res = await request(app)
//         .post("/api/allDocument")
//         .set("Authorization", `Bearer ${token}`)
//         .send({});
  
//       expect(res.statusCode).toBe(400);
//       expect(res.body.success).toBe(false);
//       expect(res.body.message).toBe("Project ID is required");
//     });
  
//   });
  
  describe("Test to delete document", () => {
    let token;
    let createdProjectId;
    let createdDocument;
  
    beforeAll(async () => {
      const email = "test@gmail.com";
      const password = "Subin@1rai";
  
      const loginRes = await request(app).post("/api/user/login").send({ email, password });
      token = loginRes.body.token;
  
      // Create dummy project
      const projectRes = await request(app)
        .post("/api/project/create")
        .set("Authorization", `Bearer ${token}`)
        .send({
          projectName: "Delete Test Project",
          ownerName: "Builder",
          budgetAmount: 10000,
          location: "Pokhara",
          startDate: "2025-07-01",
          endDate: "2025-08-01",
        });
  
      createdProjectId = projectRes.body.result.newProject.id;
  
      createdDocument = await prisma.documentFiles.create({
        data: {
          name: "TestDoc.pdf",
          file: "https://dummycloudinary.com/testdoc.pdf",
          projectId: createdProjectId,
          isVisible: true,
        },
      });
    });
  
    afterAll(async () => {
      if (createdDocument?.id) {
        await prisma.documentFiles.deleteMany({ where: { projectId: createdProjectId } });
      }
      if (createdProjectId) {
        await prisma.budget.deleteMany({ where: { projectId: createdProjectId } });
        await prisma.project.delete({ where: { id: createdProjectId } });
      }
      await prisma.$disconnect();
    });
  
    it("should successfully soft delete selected documents", async () => {
      const res = await request(app)
        .post("/api/document/delete")
        .set("Authorization", `Bearer ${token}`)
        .send({ fileIds: [createdDocument.id] });
  
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Files deleted successfully.");
  
      const updatedDoc = await prisma.documentFiles.findUnique({ where: { id: createdDocument.id } });
      expect(updatedDoc.isVisible).toBe(false);
    });
  
    it("should return 400 if no fileIds are provided", async () => {
      const res = await request(app)
        .post("/api/document/delete")
        .set("Authorization", `Bearer ${token}`)
        .send({ fileIds: [] });
  
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("No files selected for deletion.");
    });
  
  });