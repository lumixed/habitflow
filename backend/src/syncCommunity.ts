import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Syncing all users with HabitFlow Community group...');

    // 1. Ensure the community group exists
    const group = await prisma.group.upsert({
        where: { invite_code: 'COMMUNITY' },
        update: {},
        create: {
            name: 'HabitFlow Community',
            description: 'Global community group for all habit builders.',
            invite_code: 'COMMUNITY',
            created_by: 'system', // We'll just use a placeholder or the first user
        }
    });

    // 2. Get all users
    const allUsers = await prisma.user.findMany({ select: { id: true } });
    console.log(`   Found ${allUsers.length} users.`);

    // 3. Add everyone to the group
    let addedCount = 0;
    for (const user of allUsers) {
        const membership = await prisma.groupMember.upsert({
            where: {
                group_id_user_id: {
                    group_id: group.id,
                    user_id: user.id
                }
            },
            update: {}, // Don't change role if already exists
            create: {
                group_id: group.id,
                user_id: user.id,
                role: 'MEMBER'
            }
        });
        if (membership) addedCount++;
    }

    console.log(`   ✅ Synced ${addedCount} users into "HabitFlow Community"`);

    // 4. Ensure challenges exist (and are in the future)
    const now = new Date();
    const nextMonth = new Date();
    nextMonth.setDate(now.getDate() + 30);

    const challenges = [
        {
            group_id: group.id,
            title: 'Hydration Hero',
            description: 'Drink 8 glasses of water every day for a month.',
            start_date: now,
            end_date: nextMonth,
            target_habit_type: 'Health',
            goal_count: 30,
            xp_reward: 500,
            coin_reward: 250
        },
        {
            group_id: group.id,
            title: 'Mindful Month',
            description: 'Meditate for 10 minutes every day.',
            start_date: now,
            end_date: nextMonth,
            target_habit_type: 'Mindfulness',
            goal_count: 20,
            xp_reward: 750,
            coin_reward: 400
        },
        {
            group_id: group.id,
            title: 'Fitness Fanatic',
            description: 'Complete 20 workout sessions.',
            start_date: now,
            end_date: nextMonth,
            target_habit_type: 'Fitness',
            goal_count: 20,
            xp_reward: 1000,
            coin_reward: 500
        }
    ];

    for (const challenge of challenges) {
        await prisma.challenge.upsert({
            where: {
                id: `fixed-id-${challenge.title.toLowerCase().replace(/\s+/g, '-')}`
            },
            update: {
                end_date: nextMonth
            },
            create: {
                id: `fixed-id-${challenge.title.toLowerCase().replace(/\s+/g, '-')}`,
                ...challenge
            }
        });
    }

    console.log('   ✅ Active challenges synced');
    console.log('🎉 Community sync complete!');
}

main()
    .catch((e) => {
        console.error('❌ Error syncing community:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
