const request = require("supertest");
const app = require("../app");
const prisma = require("../utils/prisma");

describe("POST /user/login", () => {
  // Test with correct credentials
  it("should return 200 and user data for valid credentials", async () => {
    const response = await request(app).post("/api/user/login").send({
      email: "test@gmail.com",
      password: "123",
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("user");
    expect(response.body).toHaveProperty("token");
  });

  // Incorrect password
  it("should return 400 for incorrect password", async () => {
    const response = await request(app).post("/api/user/login").send({
      email: "test@gmail.com",
      password: "wrongpassword",
    });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("error", "Invalid password");
  });

  // Non-existent email
  it("should return 400 for non-existent email", async () => {
    const response = await request(app).post("/api/user/login").send({
      email: "noUser@gmail.com",
      password: "123",
    });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("error", "User not found");
  });

  // Missing data
  it("should return 400 when email and password are missing", async () => {
    const response = await request(app).post("/api/user/login").send({});
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("error", "All fields are required");
  });

  it("should return 400 when email is missing", async () => {
    const response = await request(app).post("/api/user/login").send({
      password: "123",
    });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("error", "All fields are required");
  });

  it("should return 400 when password is missing", async () => {
    const response = await request(app).post("/api/user/login").send({
      email: "test@gmail.com",
    });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("error", "All fields are required");
  });
});

describe("POST /user/signUp", () => {
  const testEmail = "test122@gmail.com";

  // ✅ Successful registration
  it("should return 201 and user registered successfully", async () => {
    const response = await request(app).post("/api/user/signUp").send({
      name: "Test",
      email: testEmail,
      password: "Subin@12",
      confirmPassword: "Subin@12",
    });

    console.log(response.data);
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty(
      "message",
      "User created successfully"
    );
  });

  // Missing fields
  it("should return 400 when fields are missing", async () => {
    const response = await request(app).post("/api/user/signUp").send({
      email: "test12@gmail.com",
      password: "StrongPass12",
    });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("message", "All fields are required");
  });

  // Passwords don't match
  it("should return 400 when passwords don't match", async () => {
    const response = await request(app).post("/api/user/signUp").send({
      name: "Test",
      email: "test12@gmail.com",
      password: "StrongPass12",
      confirmPassword: "WrongPass12",
    });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("message", "Password didn't match !");
  });

  // Duplicate email
  it("should return 400 when user already exists", async () => {
    const response = await request(app).post("/api/user/signUp").send({
      name: "Test",
      email: "test12@gmail.com",
      password: "StrongPass12",
      confirmPassword: "StrongPass12",
    });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("message", "User already exists");
  });

  // ✅ Cleanup test user
  afterAll(async () => {
    try {
      await prisma.user.delete({
        where: {
          email: testEmail,
        },
      });
    } catch (err) {
      console.warn("Test cleanup skipped: user not found or already deleted.");
    }
  });
});

//OTP request
describe("User OTP Request - POST /api/user/requestotp", () => {
  const testEmail = "bantawasubin@gmail.com";

  it("should return 200 and send OTP to existing user", async () => {
    const response = await request(app)
      .post("/api/user/requestotp")
      .send({ email: testEmail });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("message", "OTP sent to email");
  });

  it("should return 404 for non-existent user", async () => {
    const response = await request(app)
      .post("/api/user/requestotp")
      .send({ email: "notfound@example.com" });

    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty("message", "Email not found");
  });
});

describe("POST /api/user/verifyOTP", () => {
  const testEmail = "bantawasubin@gmail.com";
  let plainOTP = "";
  let hashedOTP = "";

  beforeAll(async () => {
    plainOTP = Math.floor(1000 + Math.random() * 9000).toString();
    const bcrypt = require("bcrypt");
    hashedOTP = await bcrypt.hash(plainOTP, 10);

    // Create user with the hashed OTP
    await prisma.user.upsert({
      where: { email: testEmail },
      update: { otp: hashedOTP },
      create: {
        username: "Verify OTP User",
        email: testEmail,
        password: "String@123",
        otp: hashedOTP,
      },
    });
  });

  it("should verify correct OTP and return 200", async () => {
    const response = await request(app)
      .post("/api/user/verifyotp")
      .send({ email: testEmail, otp: plainOTP });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("message", "OTP verified");
  });

  it("should return 401 for incorrect OTP", async () => {
    const resetOTP = await require("bcrypt").hash("1234", 10);
    await prisma.user.update({
      where: { email: testEmail },
      data: { otp: resetOTP },
    });

    const response = await request(app)
      .post("/api/user/verifyOTP")
      .send({ email: testEmail, otp: "0000" });

    expect(response.statusCode).toBe(401);
    expect(response.body).toHaveProperty("message", "Invalid OTP");
  });

  it("should return 404 for non-existent user", async () => {
    const response = await request(app)
      .post("/api/user/verifyotp")
      .send({ email: "nouser@example.com", otp: "1234" });

    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty("message", "User not found");
  });
});


describe('POST /api/user/resetPassword', () => {
  const testEmail = 'bantawasubin@gmail.com';

  it('should reset password with valid input', async () => {
    const response = await request(app)
      .post('/api/user/resetpassword')
      .send({
        email: testEmail,
        password: 'NewStrong@123',
        confirmPassword: 'NewStrong@123',
      });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('message', 'Password reset successful');
  });

  it('should return 400 for invalid email format', async () => {
    const response = await request(app)
      .post('/api/user/resetpassword')
      .send({
        email: 'invalid-email',
        password: 'NewStrong@123',
        confirmPassword: 'NewStrong@123',
      });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('message', 'Invalid email address');
  });

  it('should return 404 for non-existent user', async () => {
    const response = await request(app)
      .post('/api/user/resetpassword')
      .send({
        email: 'notfound@gmail.com',
        password: 'NewStrong@123',
        confirmPassword: 'NewStrong@123',
      });

    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty('message', 'User not found');
  });

  it('should return 400 for weak password', async () => {
    const response = await request(app)
      .post('/api/user/resetpassword')
      .send({
        email: testEmail,
        password: 'weak',
        confirmPassword: 'weak',
      });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('message', 'Password is not strong');
  });

  it('should return 400 if passwords do not match', async () => {
    const response = await request(app)
      .post('/api/user/resetpassword')
      .send({
        email: testEmail,
        password: 'Strong@123',
        confirmPassword: 'Mismatch@123',
      });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('message', 'Passwords do not match');
  });
});
