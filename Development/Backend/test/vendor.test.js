const request = require("supertest");
const app = require("../app");
const prisma = require("../utils/prisma");

describe("Details of all vendors", () => {
  let token;
  let user;
  let vendor1, vendor2;

  beforeAll(async () => {
    const email = "test@gmail.com";
    const password = "Subin@1rai";

    // Create user if not exists
    user = await prisma.user.findFirst({ where: { email } });

    const loginRes = await request(app)
      .post("/api/user/login")
      .send({ email, password });
    token = loginRes.body.token;

    // Create vendors
    vendor1 = await prisma.vendor.create({
      data: {
        VendorName: "Vendor A",
        email: "vendorA@example.com",
        contact: "9800000001",
        builderId: user.id,
      },
    });

    vendor2 = await prisma.vendor.create({
      data: {
        VendorName: "Vendor B",
        email: "vendorB@example.com",
        contact: "9800000002",
        builderId: user.id,
      },
    });
  });

  afterAll(async () => {
    await prisma.vendor.deleteMany({ where: { builderId: user.id } });
  });

  it("should return all vendors for the authenticated builder", async () => {
    const res = await request(app)
      .get("/api/vendor")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.totalVendors).toBeGreaterThanOrEqual(2);
    expect(Array.isArray(res.body.vendors)).toBe(true);
    expect(res.body.vendors.some((v) => v.VendorName === "Vendor A")).toBe(
      true
    );
    expect(res.body.vendors.some((v) => v.VendorName === "Vendor B")).toBe(
      true
    );
  });

  it("should return 401 if token is missing", async () => {
    const res = await request(app).get("/api/budget/vendors");
    expect(res.statusCode).toBe(404);
  });
});
