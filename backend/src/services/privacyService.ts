import prisma from '../config/prisma';
import { AppError } from '../middleware/errorHandler';

export async function deleteAccount(userId: string) {
    // Prisma will handle cascade deletes if configured in schema
    return await prisma.user.delete({
        where: { id: userId }
    });
}

export async function updatePrivacySettings(userId: string, data: any) {
    const allowedFields = ['is_profile_public', 'is_anonymous', 'data_retention_days', 'two_factor_enabled'];
    const updateData: any = {};

    for (const key of allowedFields) {
        if (data[key] !== undefined) {
            updateData[key] = data[key];
        }
    }

    if (Object.keys(updateData).length === 0) {
        throw new AppError('No valid fields to update', 400);
    }

    return await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
            id: true,
            is_profile_public: true,
            is_anonymous: true,
            data_retention_days: true,
            two_factor_enabled: true
        }
    });
}
