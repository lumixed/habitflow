import prisma from '../config/prisma';
import { AppError } from '../middleware/errorHandler';

interface CreateGroupInput {
    name: string;
    description?: string;
    created_by: string;
}

export async function createGroup(input: CreateGroupInput) {
    if (!input.name || input.name.trim().length === 0) {
        throw new AppError('Group name is required', 400);
    }

    const group = await prisma.$transaction(async (tx) => {
        const newGroup = await tx.group.create({
        data: {
            name: input.name.trim(),
            description: input.description?.trim() || null,
            created_by: input.created_by,
        },
        });

        await tx.groupMember.create({
        data: {
            group_id: newGroup.id,
            user_id: input.created_by,
            role: 'OWNER',
        },
        });

        return newGroup;
    });

    return group;
}


export async function joinGroup(invite_code: string, user_id: string) {
    const group = await prisma.group.findUnique({
        where: { invite_code },
    });

    if (!group) {
        throw new AppError('Invalid invite code', 404);
    }

    const existing = await prisma.groupMember.findUnique({
        where: {
        group_id_user_id: {
            group_id: group.id,
            user_id,
        },
        },
    });

    if (existing) {
        throw new AppError('Already a member of this group', 409);
    }

    await prisma.groupMember.create({
        data: {
        group_id: group.id,
        user_id,
        role: 'MEMBER',
        },
    });

    return group;
}

export async function getGroupsByUser(user_id: string) {
    const memberships = await prisma.groupMember.findMany({
        where: { user_id },
        include: {
        group: {
            include: {
            _count: {
                select: { members: true },
            },
            },
        },
        },
        orderBy: { joined_at: 'desc' },
    });

    return memberships.map((m) => ({
        id: m.group.id,
        name: m.group.name,
        description: m.group.description,
        invite_code: m.group.invite_code,
        created_by: m.group.created_by,
        member_count: m.group._count.members,
        role: m.role,
        joined_at: m.joined_at,
    }));
}


export async function getGroupDetails(group_id: string, user_id: string) {
    const membership = await prisma.groupMember.findUnique({
        where: {
        group_id_user_id: {
            group_id,
            user_id,
        },
        },
    });

    if (!membership) {
        throw new AppError('Group not found', 404);
    }

    const group = await prisma.group.findUnique({
        where: { id: group_id },
        include: {
        members: {
            include: {
            user: {
                select: {
                id: true,
                display_name: true,
                avatar_url: true,
                },
            },
            },
        },
        },
  });

  if (!group) {
    throw new AppError('Group not found', 404);
  }

    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    const membersWithActivity = await Promise.all(
        group.members.map(async (member) => {
        const habits = await prisma.habit.findMany({
            where: {
            user_id: member.user_id,
            is_active: true,
            },
            select: {
            id: true,
            title: true,
            color: true,
            icon: true,
            },
        });

        const completions = await prisma.completion.findMany({
            where: {
            user_id: member.user_id,
            completed_date: {
                gte: sevenDaysAgo,
            },
            },
            select: {
            habit_id: true,
            completed_date: true,
            },
        });

        return {
            id: member.user.id,
            display_name: member.user.display_name,
            avatar_url: member.user.avatar_url,
            role: member.role,
            joined_at: member.joined_at,
            habits,
            recent_completions: completions,
        };
        })
    );

    return {
        id: group.id,
        name: group.name,
        description: group.description,
        invite_code: group.invite_code,
        created_by: group.created_by,
        created_at: group.created_at,
        members: membersWithActivity,
    };
}

export async function leaveGroup(group_id: string, user_id: string) {
    const membership = await prisma.groupMember.findUnique({
        where: {
        group_id_user_id: {
            group_id,
            user_id,
        },
        },
    });

    if (!membership) {
        throw new AppError('Not a member of this group', 404);
    }

    if (membership.role === 'OWNER') {
        const ownerCount = await prisma.groupMember.count({
        where: {
            group_id,
            role: 'OWNER',
        },
        });

        if (ownerCount === 1) {
        throw new AppError('Cannot leave - you are the only owner. Delete the group instead.', 400);
        }
    }

    await prisma.groupMember.delete({
        where: {
        group_id_user_id: {
            group_id,
            user_id,
        },
        },
    });

    return { message: 'Left group' };
}

export async function deleteGroup(group_id: string, user_id: string) {
    const membership = await prisma.groupMember.findUnique({
        where: {
        group_id_user_id: {
            group_id,
            user_id,
        },
        },
    });

    if (!membership || membership.role !== 'OWNER') {
        throw new AppError('Only the group owner can delete the group', 403);
    }

    await prisma.group.delete({
        where: { id: group_id },
    });

    return { message: 'Group deleted' };
}
