import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma';
import { AppError } from '../middleware/errorHandler';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const JWT_EXPIRES_IN = '7d';


interface SignupInput {
    email: string;
    password: string;
    display_name: string;
}

interface LoginInput {
    email: string;
    password: string;
}

export interface TokenPayload {
    sub: string;
    email: string;
    display_name: string;
}


function validateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function signToken(payload: TokenPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}


export async function signup({ email, password, display_name }: SignupInput) {
    if (!email || !password || !display_name) {
        throw new AppError('Email, password, and display name are required', 400);
    }
    if (!validateEmail(email)) {
        throw new AppError('Invalid email format', 400);
    }
    if (password.length < 6) {
        throw new AppError('Password must be at least 6 characters', 400);
    }
    if (display_name.trim().length === 0) {
        throw new AppError('Display name cannot be empty', 400);
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        throw new AppError('Email already in use', 409);
    }

    const password_hash = await bcrypt.hash(password, 12);
    const user = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
            data: {
                email,
                password_hash,
                display_name: display_name.trim(),
                xp: 0,
                level: 1,
                coins: 0,
            },
        });
        await tx.notificationPref.create({
            data: { user_id: newUser.id },
        });
        await tx.analytics.create({
            data: { user_id: newUser.id },
        });

        return newUser;
    });
    const token = signToken({
        sub: user.id,
        email: user.email,
        display_name: user.display_name,
    });

    return {
        token,
        user: {
            id: user.id,
            email: user.email,
            display_name: user.display_name,
        },
    };
}

// ─── Login ────────────────────────────────────────────────────────────

export async function login({ email, password }: LoginInput) {
    if (!email || !password) {
        throw new AppError('Email and password are required', 400);
    }

    // Find user by email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        // Return generic message — don't reveal whether the email exists
        throw new AppError('Invalid email or password', 401);
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
        throw new AppError('Invalid email or password', 401);
    }

    // Sign and return JWT
    const token = signToken({
        sub: user.id,
        email: user.email,
        display_name: user.display_name,
    });

    return {
        token,
        user: {
            id: user.id,
            email: user.email,
            display_name: user.display_name,
        },
    };
}

// ─── Get Current User ─────────────────────────────────────────────────

export async function getUserById(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            email: true,
            display_name: true,
            avatar_url: true,
            created_at: true,
        },
    });

    if (!user) {
        throw new AppError('User not found', 404);
    }

    return user;
}

// ─── Token Verification (used by auth middleware) ─────────────────────

export function verifyToken(token: string): TokenPayload {
    try {
        return jwt.verify(token, JWT_SECRET) as TokenPayload;
    } catch {
        throw new AppError('Invalid or expired token', 401);
    }
}
