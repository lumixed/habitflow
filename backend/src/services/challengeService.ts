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
 * Get all challenges for a user (Active and Available)
 */
export async function getUserChallenges(userId: string) {
    const now = new Date();

    // Challenges user is already participating in
    const activeMemberships = await prisma.challengeMember.findMany({
        where: { user_id: userId },
        include: {
            challenge: {
                include: {
                    group: { select: { name: true } },
                    participants: {
                        include: {
                            user: {
                                select: { id: true, display_name: true, avatar_url: true }
                            }
                        }
                    }
                }
            }
        }
    });

    // Groups user is a member of
    const userGroups = await prisma.groupMember.findMany({
        where: { user_id: userId },
        select: { group_id: true }
    });

    const groupIds = userGroups.map(g => g.group_id);

    // Challenges in those groups that user hasn't joined yet
    const availableChallenges = await prisma.challenge.findMany({
        where: {
            group_id: { in: groupIds },
            end_date: { gte: now },
            participants: {
                none: { user_id: userId }
            }
        },
        include: {
            group: { select: { name: true } },
            participants: {
                include: {
                    user: {
                        select: { id: true, display_name: true, avatar_url: true }
                    }
                }
            }
        }
    });

    return {
        active: activeMemberships.map(m => ({
            ...m.challenge,
            progress_count: m.progress_count,
            is_completed: m.is_completed,
            completed_at: m.completed_at
        })),
        available: availableChallenges
    };
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
        const newProgress = membership.progress_count + 1;
        const reachedGoal = !membership.is_completed && newProgress >= membership.challenge.goal_count;

        await prisma.challengeMember.update({
            where: { id: membership.id },
            data: {
                progress_count: newProgress,
                is_completed: reachedGoal || membership.is_completed,
                completed_at: reachedGoal ? now : membership.completed_at,
            },
        });

        if (reachedGoal) {
            // Award rewards to user
            await prisma.user.update({
                where: { id: userId },
                data: {
                    xp: { increment: membership.challenge.xp_reward },
                    coins: { increment: membership.challenge.coin_reward },
                },
            });

            // Log completion activity
            const { logActivity } = require('./socialService');
            logActivity(
                userId,
                'STREAK_MILESTONE', // Using milestone type for challenge completion for now
                membership.challenge.id,
                `Completed challenge: ${membership.challenge.title}`,
                {
                    challengeId: membership.challenge.id,
                    title: membership.challenge.title,
                    xp: membership.challenge.xp_reward,
                    coins: membership.challenge.coin_reward
                }
            ).catch((err: any) => console.error('Failed to log challenge completion activity:', err));
        }
    }
}
