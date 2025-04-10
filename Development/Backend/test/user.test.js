const request = require('supertest');
const app = require('../app'); 

describe('POST /user/login', () => {

  // ✅ Test with correct credentials
  it('should return 200 and user data for valid credentials', async () => { 
    const response = await request(app).post('/api/user/login').send({
      email: 'test@gmail.com',
      password: '123'
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('user');
    expect(response.body).toHaveProperty('token');
  });

  //  Test with incorrect credentials
  it('should return 400 for incorrect password', async () => {
    const response = await request(app).post('/api/user/login').send({
      email: 'test@gmail.com',
      password: 'wrongpassword'
    });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('error', 'Invalid password');

  });

  it('should return 400 for non-existent email', async () => {
    const response = await request(app).post('/api/user/login').send({
      email: 'noUser@gmail.com',
      password: '123'
    });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('error', 'User not found');
  });

  //  Test with missing data
  it('should return 400 when email and password are missing', async () => {
    const response = await request(app).post('/api/user/login').send({});

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('error', 'All fields are required');
  });

  it('should return 400 when email is missing', async () => {
    const response = await request(app).post('/api/user/login').send({
      password: '123'
    });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('error', 'All fields are required');
  });

  it('should return 400 when password is missing', async () => {
    const response = await request(app).post('/api/user/login').send({
      email: 'test@gmail.com'
    });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('error', 'All fields are required');
  });
});


// Test for user registration
describe('POST /user/signUp', () => {

  // // ✅ Successful registration
  // it('should return 201 and user registered successfully', async () => {
  //   const response = await request(app).post('/api/user/signUp').send({
  //     name: "Test",
  //     email: "test1232@gmail.com",
  //     password: "StrongPass12",
  //     confirmPassword: "StrongPass12",
  //   });

  //   expect(response.statusCode).toBe(201);
  //   expect(response.body).toHaveProperty('message', 'User created successfully');
  // });

  //  Missing fields
  it('should return 400 when fields are missing', async () => {
    const response = await request(app).post('/api/user/signUp').send({
      email: "test12@gmail.com",
      password: "StrongPass12"
    });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('message', 'All fields are required');
  });

  //  Passwords don't match
  it("should return 400 when passwords don't match", async () => {
    const response = await request(app).post('/api/user/signUp').send({
      name: "Test",
      email: "test12@gmail.com",
      password: "StrongPass12",
      confirmPassword: "WrongPass12",
    });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('message', "Password didn't match !");
  });

  // Duplicate email
  it('should return 400 when user already exists', async () => {

    const response = await request(app).post('/api/user/signUp').send({
      name: "Test",
      email: "test12@gmail.com",
      password: "StrongPass12",
      confirmPassword: "StrongPass12",
    });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('message', 'User already exists');
  });
});
