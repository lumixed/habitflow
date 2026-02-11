/**
 * Seed script for gamification data
 * Run with: npx ts-node src/seed.ts
 */

import { PrismaClient } from '@prisma/client';
import { seedAchievements } from './services/achievementService';
import { seedPowerups } from './services/gamificationService';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding gamification data...');

    // Seed achievements
    console.log('   Seeding achievements...');
    await seedAchievements();
    console.log('   ✅ Achievements seeded');

    // Seed powerups
    console.log('   Seeding powerups...');
    await seedPowerups();
    console.log('   ✅ Powerups seeded');

    console.log('🎉 Seeding complete!');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding data:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
