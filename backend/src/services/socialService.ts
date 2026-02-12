import prisma from '../config/prisma';
import { AppError } from '../middleware/errorHandler';

/**
 * Send a friend request
 */
export async function sendFriendRequest(senderId: string, receiverId: string) {
    if (senderId === receiverId) {
        throw new AppError('You cannot send a friend request to yourself', 400);
    }

    // Check if they are already friends
    const existingFriendship = await prisma.friendship.findFirst({
        where: {
            OR: [
                { user_id: senderId, friend_id: receiverId },
                { user_id: receiverId, friend_id: senderId }
            ]
        }
    });

    if (existingFriendship) {
        throw new AppError('You are already friends with this user', 400);
    }

    // Check if a request already exists
    const existingRequest = await prisma.friendRequest.findFirst({
        where: {
            OR: [
                { sender_id: senderId, receiver_id: receiverId },
                { sender_id: receiverId, receiver_id: senderId }
            ]
        }
    });

    if (existingRequest) {
        if (existingRequest.status === 'PENDING') {
            throw new AppError('A friend request is already pending', 400);
        }
        // If declined, we can update it back to pending
        return await prisma.friendRequest.update({
            where: { id: existingRequest.id },
            data: { sender_id: senderId, receiver_id: receiverId, status: 'PENDING' }
        });
    }

    return await prisma.friendRequest.create({
        data: {
            sender_id: senderId,
            receiver_id: receiverId,
            status: 'PENDING'
        }
    });
}

/**
 * Handle friend request (ACCEPT/DECLINE)
 */
export async function handleFriendRequest(requestId: string, userId: string, action: 'ACCEPT' | 'DECLINE') {
    const request = await prisma.friendRequest.findUnique({
        where: { id: requestId }
    });

    if (!request || request.receiver_id !== userId) {
        throw new AppError('Friend request not found', 404);
    }

    if (request.status !== 'PENDING') {
        throw new AppError('This request has already been handled', 400);
    }

    if (action === 'DECLINE') {
        return await prisma.friendRequest.update({
            where: { id: requestId },
            data: { status: 'DECLINED' }
        });
    }

    // ACCEPT - Create friendship and update request
    return await prisma.$transaction(async (tx) => {
        await tx.friendRequest.update({
            where: { id: requestId },
            data: { status: 'ACCEPTED' }
        });

        // Create bidirectional friendship entries
        await tx.friendship.createMany({
            data: [
                { user_id: request.sender_id, friend_id: request.receiver_id },
                { user_id: request.receiver_id, friend_id: request.sender_id }
            ]
        });

        return { message: 'Friend request accepted' };
    });
}

/**
 * Get friend list
 */
export async function getFriends(userId: string) {
    const friendships = await prisma.friendship.findMany({
        where: { user_id: userId },
        include: {
            friend: {
                select: {
                    id: true,
                    display_name: true,
                    avatar_url: true,
                    level: true,
                    xp: true
                }
            }
        }
    });

    return friendships.map(f => f.friend);
}

/**
 * Get social feed for a user
 */
export async function getSocialFeed(userId: string, limit = 20, offset = 0) {
    // Get friend IDs
    const friendships = await prisma.friendship.findMany({
        where: { user_id: userId },
        select: { friend_id: true }
    });

    const friendIds = friendships.map(f => f.friend_id);
    // Include self in feed
    const userIds = [userId, ...friendIds];

    return await prisma.socialActivity.findMany({
        where: { user_id: { in: userIds } },
        include: {
            user: {
                select: {
                    id: true,
                    display_name: true,
                    avatar_url: true
                }
            },
            reactions: {
                include: {
                    user: {
                        select: { id: true, display_name: true }
                    }
                }
            },
            _count: {
                select: { comments: true }
            }
        },
        orderBy: { created_at: 'desc' },
        take: limit,
        skip: offset
    });
}

/**
 * Search for users to add as friends
 */
export async function searchUsers(query: string, currentUserId: string) {
    return await prisma.user.findMany({
        where: {
            AND: [
                { id: { not: currentUserId } },
                {
                    OR: [
                        { display_name: { contains: query, mode: 'insensitive' } },
                        { email: { contains: query, mode: 'insensitive' } }
                    ]
                }
            ]
        },
        select: {
            id: true,
            display_name: true,
            avatar_url: true,
            level: true
        },
        take: 10
    });
}

/**
 * Log a social activity
 */
export async function logActivity(userId: string, type: 'HABIT_COMPLETED' | 'LEVEL_UP' | 'ACHIEVEMENT_UNLOCKED' | 'STREAK_MILESTONE', contentId?: string, contentText?: string, metadata?: any) {
    return await prisma.socialActivity.create({
        data: {
            user_id: userId,
            type,
            content_id: contentId,
            content_text: contentText,
            metadata: metadata || {}
        }
    });
}
