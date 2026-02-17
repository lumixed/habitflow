import prisma from './config/prisma';
import { ReferralService } from './services/referralService';

async function backfill() {
    console.log('Starting referral code backfill...');
    const users = await prisma.user.findMany({
        where: { referral_code: null }
    });

    console.log(`Found ${users.length} users needing backfill.`);

    for (const user of users) {
        const code = await ReferralService.generateUniqueCode();
        await prisma.user.update({
            where: { id: user.id },
            data: { referral_code: code }
        });
        console.log(`Updated user ${user.display_name} with code ${code}`);
    }

    console.log('Backfill complete.');
}

backfill()
    .catch(err => console.error(err))
    .finally(() => prisma.$disconnect());
