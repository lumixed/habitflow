import prisma from '../config/prisma';
import { AppError } from '../middleware/errorHandler';

/**
 * React to a social activity
 */
export async function reactToActivity(userId: string, activityId: string, type = 'LIKE') {
    const activity = await prisma.socialActivity.findUnique({
        where: { id: activityId }
    });

    if (!activity) {
        throw new AppError('Activity not found', 404);
    }

    // Check if already reacted
    const existing = await prisma.reaction.findUnique({
        where: {
            activity_id_user_id_type: {
                activity_id: activityId,
                user_id: userId,
                type
            }
        }
    });

    if (existing) {
        // Toggle: Remove if exists
        return await prisma.reaction.delete({
            where: { id: existing.id }
        });
    }

    return await prisma.reaction.create({
        data: {
            activity_id: activityId,
            user_id: userId,
            type
        }
    });
}

/**
 * Add a comment to an activity
 */
export async function addComment(userId: string, activityId: string, content: string) {
    if (!content || content.trim().length === 0) {
        throw new AppError('Comment content is required', 400);
    }

    const activity = await prisma.socialActivity.findUnique({
        where: { id: activityId }
    });

    if (!activity) {
        throw new AppError('Activity not found', 404);
    }

    return await prisma.comment.create({
        data: {
            activity_id: activityId,
            user_id: userId,
            content: content.trim()
        }
    });
}

/**
 * Delete a comment
 */
export async function deleteComment(userId: string, commentId: string) {
    const comment = await prisma.comment.findUnique({
        where: { id: commentId }
    });

    if (!comment) {
        throw new AppError('Comment not found', 404);
    }

    if (comment.user_id !== userId) {
        throw new AppError('Unauthorized', 403);
    }

    return await prisma.comment.delete({
        where: { id: commentId }
    });
}
