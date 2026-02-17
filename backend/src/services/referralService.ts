import prisma from '../config/prisma';
import crypto from 'crypto';
import { AppError } from '../middleware/errorHandler';

/**
 * Service to handle Referral Program logic
 */
export class ReferralService {
    /**
     * Generate a unique 8-character referral code
     */
    static async generateUniqueCode(): Promise<string> {
        let code = '';
        let isUnique = false;

        while (!isUnique) {
            code = crypto.randomBytes(4).toString('hex').toUpperCase();
            const existing = await prisma.user.findUnique({
                where: { referral_code: code }
            });
            if (!existing) isUnique = true;
        }

        return code;
    }

    /**
     * Process a referral during signup
     */
    static async processReferral(referredUserId: string, referralCode: string) {
        if (!referralCode) return;

        const referrer = await prisma.user.findUnique({
            where: { referral_code: referralCode }
        });

        if (!referrer) {
            console.warn(`Invalid referral code used: ${referralCode}`);
            return;
        }

        if (referrer.id === referredUserId) {
            console.warn(`User ${referredUserId} tried to refer themselves.`);
            return;
        }

        // Create referral record
        await prisma.referral.create({
            data: {
                referrer_id: referrer.id,
                referred_id: referredUserId,
                rewarded: true // Mark as rewarded immediately for now
            }
        });

        // Trigger rewards
        await this.distributeRewards(referrer.id, referredUserId);
    }

    /**
     * Distribute rewards (XP, Coins) to both parties
     */
    private static async distributeRewards(referrerId: string, referredId: string) {
        const REFERRER_XP = 100;
        const REFERRER_COINS = 50;
        const REFERRED_XP = 50;
        const REFERRED_COINS = 25;

        await prisma.$transaction([
            // Reward Referrer
            prisma.user.update({
                where: { id: referrerId },
                data: {
                    xp: { increment: REFERRER_XP },
                    coins: { increment: REFERRER_COINS }
                }
            }),
            // Reward Referred
            prisma.user.update({
                where: { id: referredId },
                data: {
                    xp: { increment: REFERRED_XP },
                    coins: { increment: REFERRED_COINS }
                }
            }),
            // Log activity for referrer
            prisma.socialActivity.create({
                data: {
                    user_id: referrerId,
                    type: 'STREAK_MILESTONE', // Generic for now, maybe add REFERRAL_BONUS later
                    content_text: `Earned a referral bonus! 🎁`
                }
            })
        ]);
    }

    /**
     * Get referral stats for a user
     */
    static async getStats(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { referral_code: true }
        });

        const referrals = await prisma.referral.findMany({
            where: { referrer_id: userId },
            include: {
                referred: {
                    select: {
                        display_name: true,
                        created_at: true
                    }
                }
            },
            orderBy: { created_at: 'desc' }
        });

        return {
            referralCode: user?.referral_code,
            totalReferrals: referrals.length,
            history: referrals.map(r => ({
                name: r.referred.display_name,
                date: r.created_at
            }))
        };
    }
}
