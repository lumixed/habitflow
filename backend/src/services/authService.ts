import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma';
import { AppError } from '../middleware/errorHandler';
import { generateSecret, verify, generateURI } from 'otplib';
import QRCode from 'qrcode';

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
    if (user.two_factor_enabled) {
        return {
            two_factor_required: true,
            userId: user.id
        };
    }

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
            xp: true,
            level: true,
            coins: true,
            theme_name: true,
            accent_color: true,
            font_family: true,
            widget_order: true,
            is_profile_public: true,
            is_anonymous: true,
            two_factor_enabled: true,
            data_retention_days: true,
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

export async function updateProfile(userId: string, data: any) {
    const allowedFields = ['display_name', 'avatar_url', 'theme_name', 'accent_color', 'font_family', 'widget_order', 'is_profile_public'];
    const updateData: any = {};

    for (const key of allowedFields) {
        if (data[key] !== undefined) {
            updateData[key] = data[key];
        }
    }

    if (Object.keys(updateData).length === 0) {
        throw new AppError('No valid fields to update', 400);
    }

    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
            id: true,
            email: true,
            display_name: true,
            avatar_url: true,
            xp: true,
            level: true,
            coins: true,
            theme_name: true,
            accent_color: true,
            widget_order: true,
            is_profile_public: true,
            is_anonymous: true,
            two_factor_enabled: true,
            data_retention_days: true,
            created_at: true,
        },
    });

    return updatedUser;
}

export async function generate2FASecret(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('User not found', 404);

    const secret = generateSecret();
    const otpauth = generateURI({
        issuer: 'HabitFlow',
        label: user.email,
        secret
    });
    const qrCodeUrl = await QRCode.toDataURL(otpauth);

    // Temporarily save secret but don't enable 2FA yet
    await prisma.user.update({
        where: { id: userId },
        data: { two_factor_secret: secret }
    });

    return { secret, qrCodeUrl };
}

export async function verifyAndEnable2FA(userId: string, token: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.two_factor_secret) throw new AppError('2FA setup not initiated', 400);

    const isValid = await verify({ token, secret: user.two_factor_secret });
    if (!isValid) throw new AppError('Invalid token', 400);

    await prisma.user.update({
        where: { id: userId },
        data: { two_factor_enabled: true }
    });

    return { message: '2FA enabled successfully' };
}

export async function loginVerify2FA(userId: string, token: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.two_factor_secret) throw new AppError('2FA not enabled', 400);

    const isValid = await verify({ token, secret: user.two_factor_secret });
    if (!isValid) throw new AppError('Invalid token', 401);

    const jwtToken = signToken({
        sub: user.id,
        email: user.email,
        display_name: user.display_name,
    });

    return {
        token: jwtToken,
        user: {
            id: user.id,
            email: user.email,
            display_name: user.display_name,
        },
    };
}

export async function disable2FA(userId: string, token: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.two_factor_secret) throw new AppError('2FA not enabled', 400);

    const isValid = await verify({ token, secret: user.two_factor_secret });
    if (!isValid) throw new AppError('Invalid token', 401);

    await prisma.user.update({
        where: { id: userId },
        data: {
            two_factor_enabled: false,
            two_factor_secret: null
        }
    });

    return { message: '2FA disabled successfully' };
}
