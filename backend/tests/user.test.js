import request from 'supertest';
import app from '../src/app.js';

const validUser = {
  username: 'testuser',
  email: 'testuser@gitnest.com',
  password: 'Password123',
};

const otherUser = {
  username: 'otheruser',
  email: 'otheruser@gitnest.com',
  password: 'Password123',
};

async function registerAndLogin(userData) {
  await request(app).post('/api/v1/auth/register').send(userData);
  const res = await request(app).post('/api/v1/auth/login').send({
    email: userData.email,
    password: userData.password,
  });
  return res.body.data.token;
}

describe('GET /api/v1/users/:username', () => {
  it('should return user profile for existing username', async () => {
    await request(app)
      .post('/api/v1/auth/register')
      .send(validUser);

    const res = await request(app)
      .get('/api/v1/users/testuser');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.username).toBe(validUser.username);
    expect(res.body.data.password).toBeUndefined();
  });

  it('should return 404 for non-existent username', async () => {
    const res = await request(app)
      .get('/api/v1/users/ghostuser999');

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

describe('PUT /api/v1/users/profile', () => {
  it('should update profile successfully with valid token', async () => {
    const token = await registerAndLogin(validUser);

    const res = await request(app)
      .put('/api/v1/users/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ bio: 'Hello cave' });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 401 if no token provided', async () => {
    const res = await request(app)
      .put('/api/v1/users/profile')
      .send({ bio: 'Hello cave' });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

describe('POST /api/v1/users/:username/follow', () => {
  it('should follow another user successfully', async () => {
    const token = await registerAndLogin(validUser);
    await request(app).post('/api/v1/auth/register').send(otherUser);

    const res = await request(app)
      .post('/api/v1/users/otheruser/follow')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 401 if not authenticated', async () => {
    await request(app).post('/api/v1/auth/register').send(otherUser);

    const res = await request(app)
      .post('/api/v1/users/otheruser/follow');

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 if user tries to follow themselves', async () => {
    const token = await registerAndLogin(validUser);

    const res = await request(app)
      .post('/api/v1/users/testuser/follow')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe('DELETE /api/v1/users/:username/follow', () => {
  it('should unfollow a user successfully', async () => {
    const token = await registerAndLogin(validUser);
    await request(app).post('/api/v1/auth/register').send(otherUser);

    await request(app)
      .post('/api/v1/users/otheruser/follow')
      .set('Authorization', `Bearer ${token}`);

    const res = await request(app)
      .delete('/api/v1/users/otheruser/follow')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 401 if not authenticated', async () => {
    await request(app).post('/api/v1/auth/register').send(otherUser);

    const res = await request(app)
      .delete('/api/v1/users/otheruser/follow');

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

describe('GET /api/v1/users/:username/followers', () => {
  it('should return followers list for a user', async () => {
    const token = await registerAndLogin(validUser);
    await request(app).post('/api/v1/auth/register').send(otherUser);

    await request(app)
      .post('/api/v1/users/otheruser/follow')
      .set('Authorization', `Bearer ${token}`);

    const res = await request(app)
      .get('/api/v1/users/otheruser/followers');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(Array.isArray(res.body.data.followers)).toBe(true);
  });

  it('should return 404 for non-existent username', async () => {
    const res = await request(app)
      .get('/api/v1/users/ghostuser999/followers');

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

describe('GET /api/v1/users/:username/following', () => {
  it('should return following list for a user', async () => {
    const token = await registerAndLogin(validUser);
    await request(app).post('/api/v1/auth/register').send(otherUser);

    await request(app)
      .post('/api/v1/users/otheruser/follow')
      .set('Authorization', `Bearer ${token}`);

    const res = await request(app)
      .get('/api/v1/users/testuser/following');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(Array.isArray(res.body.data.following)).toBe(true);
  });

  it('should return 404 for non-existent username', async () => {
    const res = await request(app)
      .get('/api/v1/users/ghostuser999/following');

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
