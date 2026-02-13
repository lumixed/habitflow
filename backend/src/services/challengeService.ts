import prisma from '../config/prisma';
import { AppError } from '../middleware/errorHandler';

interface CreateChallengeInput {
    group_id: string;
    title: string;
    description?: string;
    start_date: Date;
    end_date: Date;
    target_habit_type?: string;
    goal_count: number;
    created_by: string; // User ID of the creator
}

/**
 * Create a new challenge within a group
 */
export async function createChallenge(input: CreateChallengeInput) {
    // Verify user is owner or admin (for now just owner of the group)
    const membership = await prisma.groupMember.findUnique({
        where: {
            group_id_user_id: {
                group_id: input.group_id,
                user_id: input.created_by,
            },
        },
    });

    if (!membership || membership.role !== 'OWNER') {
        throw new AppError('Only group owners can create challenges', 403);
    }

    const challenge = await prisma.challenge.create({
        data: {
            group_id: input.group_id,
            title: input.title,
            description: input.description,
            start_date: input.start_date,
            end_date: input.end_date,
            target_habit_type: input.target_habit_type,
            goal_count: input.goal_count,
        },
    });

    return challenge;
}

/**
 * Join an existing challenge
 */
export async function joinChallenge(challengeId: string, userId: string) {
    const challenge = await prisma.challenge.findUnique({
        where: { id: challengeId },
        include: { group: { include: { members: true } } },
    });

    if (!challenge) {
        throw new AppError('Challenge not found', 404);
    }

    // Verify user is a member of the group
    const isMember = challenge.group.members.some((m: any) => m.user_id === userId);
    if (!isMember) {
        throw new AppError('You must be a member of the group to join this challenge', 403);
    }

    const existing = await prisma.challengeMember.findUnique({
        where: {
            challenge_id_user_id: {
                challenge_id: challengeId,
                user_id: userId,
            },
        },
    });

    if (existing) {
        throw new AppError('Already participating in this challenge', 409);
    }

    const membership = await prisma.challengeMember.create({
        data: {
            challenge_id: challengeId,
            user_id: userId,
        },
    });

    return membership;
}

/**
 * Get challenge details including leaderboard
 */
export async function getChallengeDetails(challengeId: string) {
    const challenge = await prisma.challenge.findUnique({
        where: { id: challengeId },
        include: {
            participants: {
                include: {
                    user: {
                        select: {
                            id: true,
                            display_name: true,
                            avatar_url: true,
                        },
                    },
                },
                orderBy: {
                    progress_count: 'desc',
                },
            },
        },
    });

    if (!challenge) {
        throw new AppError('Challenge not found', 404);
    }

    return challenge;
}

/**
 * Update progress for active challenges when a habit is completed
 * This is intended to be called from a hook in completionService/socialService
 */
export async function updateChallengeProgress(userId: string, habit_id: string) {
    // Find active challenges for this user where the habit might match
    // For now, we'll keep it simple: any completion counts if it's within the challenge dates
    const now = new Date();

    const activeChallenges = await prisma.challengeMember.findMany({
        where: {
            user_id: userId,
            challenge: {
                start_date: { lte: now },
                end_date: { gte: now },
            },
        },
        include: { challenge: true },
    });

    if (activeChallenges.length === 0) return;

    for (const membership of activeChallenges) {
        await prisma.challengeMember.update({
            where: { id: membership.id },
            data: {
                progress_count: { increment: 1 },
            },
        });
    }
}
