import request from 'supertest';
import app from '../src/index';
import prisma from '../src/config/prisma';

beforeAll(async () => {
    await prisma.user.deleteMany({
        where: {
        email: {
            contains: 'test@',
        },
        },
    });
});

afterAll(async () => {
    await prisma.user.deleteMany({
        where: {
        email: {
            contains: 'test@',
        },
        },
    });
    await prisma.$disconnect();
});

describe('Auth Endpoints', () => {
    let authToken: string;
    const testUser = {
        email: 'test@habitflow.com',
        password: 'testpass123',
        display_name: 'Test User',
    };

    describe('POST /api/auth/signup', () => {
        it('should create a new user with valid data', async () => {
        const res = await request(app)
            .post('/api/auth/signup')
            .send(testUser)
            .expect(201);

        expect(res.body).toHaveProperty('token');
        expect(res.body).toHaveProperty('user');
        expect(res.body.user.email).toBe(testUser.email);
        expect(res.body.user.display_name).toBe(testUser.display_name);

        authToken = res.body.token;
        });

        it('should reject duplicate email', async () => {
        const res = await request(app)
            .post('/api/auth/signup')
            .send(testUser)
            .expect(409);

        expect(res.body.error).toContain('already in use');
        });

        it('should reject invalid email format', async () => {
        const res = await request(app)
            .post('/api/auth/signup')
            .send({
            email: 'notanemail',
            password: 'testpass',
            display_name: 'Test',
            })
            .expect(400);

        expect(res.body.error).toContain('Invalid email');
        });

        it('should reject password under 6 characters', async () => {
        const res = await request(app)
            .post('/api/auth/signup')
            .send({
            email: 'test2@habitflow.com',
            password: '12345',
            display_name: 'Test',
            })
            .expect(400);

        expect(res.body.error).toContain('at least 6 characters');
        });
    });

    describe('POST /api/auth/login', () => {
        it('should login with correct credentials', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
            email: testUser.email,
            password: testUser.password,
            })
            .expect(200);

        expect(res.body).toHaveProperty('token');
        expect(res.body.user.email).toBe(testUser.email);
        });

        it('should reject wrong password', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
            email: testUser.email,
            password: 'wrongpassword',
            })
            .expect(401);

        expect(res.body.error).toContain('Invalid email or password');
        });

        it('should reject non-existent user', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
            email: 'nonexistent@habitflow.com',
            password: 'password',
            })
            .expect(401);

        expect(res.body.error).toContain('Invalid email or password');
        });
    });

    describe('GET /api/auth/me', () => {
        it('should return user data with valid token', async () => {
        const res = await request(app)
            .get('/api/auth/me')
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200);

        expect(res.body.user.email).toBe(testUser.email);
        expect(res.body.user.display_name).toBe(testUser.display_name);
        });

        it('should reject request without token', async () => {
        await request(app).get('/api/auth/me').expect(401);
        });

        it('should reject invalid token', async () => {
        await request(app)
            .get('/api/auth/me')
            .set('Authorization', 'Bearer invalid_token')
            .expect(401);
        });
    });
});
