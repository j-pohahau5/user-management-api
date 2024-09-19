const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app'); 
const User = require('../models/userModel');
const dotenv = require('dotenv');

dotenv.config();

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
  await User.deleteMany({});
  await mongoose.connection.close();
});

describe('User API', () => {
  let token;
  const userPayload = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
  };

  it('should register a new user', async () => {
    const response = await request(app).post('/api/users/register').send(userPayload);
    expect(response.status).toBe(201);
    expect(response.body.message).toBe('User created');
  });

  it('should login a user', async () => {
    const response = await request(app).post('/api/users/login').send({
      email: userPayload.email,
      password: userPayload.password,
    });
    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();
    token = response.body.token;
  });

  it('should get user profile', async () => {
    const response = await request(app)
      .get('/api/users/profile')
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body.username).toBe(userPayload.username);
    expect(response.body.email).toBe(userPayload.email);
  });

  it('should update user profile', async () => {
    const updatedPayload = {
      username: 'updateduser',
      email: 'updated@example.com',
    };

    const response = await request(app)
      .put('/api/users/profile')
      .set('Authorization', `Bearer ${token}`)
      .send(updatedPayload);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Profile updated');
  });

  it('should get updated user profile', async () => {
    const response = await request(app)
      .get('/api/users/profile')
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body.username).toBe('updateduser');
    expect(response.body.email).toBe('updated@example.com');
  });

  it('should delete user profile', async () => {
    const response = await request(app)
      .delete('/api/users/profile')
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Profile deleted');
  });

  it('should return an error for getting deleted user profile', async () => {
    const response = await request(app)
      .get('/api/users/profile')
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(404);
    expect(response.body.message).toBe('User not found');
  });

  it('should return an error for invalid credentials during login', async () => {
    const response = await request(app).post('/api/users/login').send({
      email: userPayload.email,
      password: 'wrongpassword',
    });
    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Invalid credentials');
  });

  it('should return an error for accessing protected route without token', async () => {
    const response = await request(app).get('/api/users/profile');
    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Unauthorized');
  });
});
