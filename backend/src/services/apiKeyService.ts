import crypto from 'crypto';
import prisma from '../config/prisma';

/**
 * Service for managing user API keys
 */
export class ApiKeyService {
    /**
     * Generate a new API key for a user
     * @returns The raw key (should be shown only once) and the record
     */
    static async generateKey(userId: string, name: string, scopes: string[] = ['read', 'write']) {
        // Generate a random 32-byte key and encoded as hex (64 chars)
        const rawKey = `hf_${crypto.randomBytes(32).toString('hex')}`;
        const keyHash = this.hashKey(rawKey);

        const apiKey = await prisma.apiKey.create({
            data: {
                user_id: userId,
                name: name,
                key_hash: keyHash,
                scopes: scopes.join(','),
            }
        });

        return { rawKey, apiKey };
    }

    /**
     * Hash a raw API key for storage or comparison
     */
    private static hashKey(rawKey: string): string {
        return crypto.createHash('sha256').update(rawKey).digest('hex');
    }

    /**
     * Validate an API key and return the associated user
     */
    static async validateKey(rawKey: string) {
        if (!rawKey.startsWith('hf_')) return null;

        const keyHash = this.hashKey(rawKey);
        const apiKeyRecord = await prisma.apiKey.findUnique({
            where: { key_hash: keyHash },
            include: { user: true }
        });

        if (!apiKeyRecord) return null;

        // Check expiration
        if (apiKeyRecord.expires_at && apiKeyRecord.expires_at < new Date()) {
            return null;
        }

        // Update last used
        await prisma.apiKey.update({
            where: { id: apiKeyRecord.id },
            data: { last_used: new Date() }
        });

        return {
            user: apiKeyRecord.user,
            scopes: apiKeyRecord.scopes.split(',')
        };
    }

    /**
     * Revoke an API key
     */
    static async revokeKey(keyId: string, userId: string) {
        return await prisma.apiKey.delete({
            where: {
                id: keyId,
                user_id: userId
            }
        });
    }

    /**
     * List user's API keys (sensitive fields hidden)
     */
    static async listKeys(userId: string) {
        return await prisma.apiKey.findMany({
            where: { user_id: userId },
            select: {
                id: true,
                name: true,
                scopes: true,
                created_at: true,
                last_used: true,
                expires_at: true
            }
        });
    }
}
