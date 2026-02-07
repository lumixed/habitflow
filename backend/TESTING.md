# Testing Guide

## Running Tests

### Backend Tests

From the `backend/` directory:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run with coverage report
npm test -- --coverage
```

### Test Database Setup

Tests use the same database as development. Before running tests:

```bash
# Make sure database is running
docker compose up db

# Run migrations
npx prisma migrate dev
```

## What's Being Tested

### Auth Tests (`tests/auth.test.ts`)
- ✅ User signup with valid data
- ✅ Duplicate email rejection
- ✅ Email format validation
- ✅ Password length validation
- ✅ Login with correct credentials
- ✅ Login rejection with wrong password
- ✅ Token verification on `/me` endpoint
- ✅ Invalid token rejection

### Habit Tests (`tests/habits.test.ts`)
- ✅ Create habit with full data
- ✅ Create habit with minimal data (defaults)
- ✅ Reject habit without title
- ✅ Get all habits for user
- ✅ Get single habit by ID
- ✅ Update habit fields
- ✅ Toggle habit active/inactive
- ✅ Delete habit
- ✅ Ownership validation (can't access other users' habits)

## Adding New Tests

1. Create a new file in `backend/tests/`
2. Follow the pattern:

```typescript
import request from 'supertest';
import app from '../src/index';
import prisma from '../src/config/prisma';

describe('Feature Name', () => {
    beforeAll(async () => {
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    describe('POST /api/endpoint', () => {
        it('should do something', async () => {
        const res = await request(app)
            .post('/api/endpoint')
            .send({ data: 'here' })
            .expect(200);

        expect(res.body).toHaveProperty('field');
        });
    });
});

```

## Coverage Goals

Current coverage:
- Auth: ~90%
- Habits: ~85%

Target: 80%+ coverage on all services and routes.

## CI/CD Integration

Tests run automatically on:
- Every commit (GitHub Actions)
- Before deployment (pre-deploy hook)

## Debugging Failed Tests

If tests fail:

1. Check the error message
2. Run the specific test file: `npm test -- auth.test.ts`
3. Add console.logs in the test
4. Check database state with Prisma Studio
5. Verify migrations are up to date
