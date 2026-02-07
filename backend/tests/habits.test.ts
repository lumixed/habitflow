import request from 'supertest';
import app from '../src/index';
import prisma from '../src/config/prisma';

let authToken: string;
let userId: string;
let habitId: string;

beforeAll(async () => {
    const res = await request(app).post('/api/auth/signup').send({
        email: 'habitest@habitflow.com',
        password: 'testpass123',
        display_name: 'Habit Test User',
    });

    authToken = res.body.token;
    userId = res.body.user.id;
});

afterAll(async () => {
    await prisma.user.delete({ where: { id: userId } });
    await prisma.$disconnect();
});

describe('Habit Endpoints', () => {
    describe('POST /api/habits', () => {
        it('should create a habit with valid data', async () => {
        const res = await request(app)
            .post('/api/habits')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
            title: 'Morning Run',
            description: '5km every morning',
            frequency: 'DAILY',
            color: '#10B981',
            icon: 'run',
            })
            .expect(201);

        expect(res.body.habit).toHaveProperty('id');
        expect(res.body.habit.title).toBe('Morning Run');
        expect(res.body.habit.frequency).toBe('DAILY');

        habitId = res.body.habit.id;
        });

        it('should reject habit without title', async () => {
        const res = await request(app)
            .post('/api/habits')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
            description: 'No title',
            })
            .expect(400);

        expect(res.body.error).toContain('required');
        });

        it('should use default values for optional fields', async () => {
        const res = await request(app)
            .post('/api/habits')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
            title: 'Minimal Habit',
            })
            .expect(201);

        expect(res.body.habit.frequency).toBe('DAILY');
        expect(res.body.habit.color).toBe('#6366F1');
        expect(res.body.habit.is_active).toBe(true);
        });
    });

    describe('GET /api/habits', () => {
        it('should return all habits for authenticated user', async () => {
        const res = await request(app)
            .get('/api/habits')
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200);

        expect(res.body.habits).toBeInstanceOf(Array);
        expect(res.body.habits.length).toBeGreaterThan(0);
        });

        it('should require authentication', async () => {
        await request(app).get('/api/habits').expect(401);
        });
    });

    describe('GET /api/habits/:id', () => {
        it('should return a specific habit', async () => {
        const res = await request(app)
            .get(`/api/habits/${habitId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200);

        expect(res.body.habit.id).toBe(habitId);
        expect(res.body.habit.title).toBe('Morning Run');
        });

        it('should return 404 for non-existent habit', async () => {
        await request(app)
            .get('/api/habits/00000000-0000-0000-0000-000000000000')
            .set('Authorization', `Bearer ${authToken}`)
            .expect(404);
        });
    });

    describe('PUT /api/habits/:id', () => {
        it('should update habit title', async () => {
        const res = await request(app)
            .put(`/api/habits/${habitId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({
            title: 'Evening Run',
            })
            .expect(200);

        expect(res.body.habit.title).toBe('Evening Run');
        });

        it('should toggle is_active', async () => {
        const res = await request(app)
            .put(`/api/habits/${habitId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({
            is_active: false,
            })
            .expect(200);

        expect(res.body.habit.is_active).toBe(false);
        });

        it('should reject empty title', async () => {
        const res = await request(app)
            .put(`/api/habits/${habitId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({
            title: '   ',
            })
            .expect(400);

        expect(res.body.error).toContain('cannot be empty');
        });
    });

    describe('DELETE /api/habits/:id', () => {
        it('should delete a habit', async () => {
        await request(app)
            .delete(`/api/habits/${habitId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200);

        await request(app)
            .get(`/api/habits/${habitId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .expect(404);
        });

        it('should return 404 when deleting non-existent habit', async () => {
        await request(app)
            .delete('/api/habits/00000000-0000-0000-0000-000000000000')
            .set('Authorization', `Bearer ${authToken}`)
            .expect(404);
        });
    });
});
