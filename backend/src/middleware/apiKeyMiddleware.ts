import { Request, Response, NextFunction } from 'express';
import { ApiKeyService } from '../services/apiKeyService';

/**
 * Middleware to authenticate requests using an API Key
 */
export const apiKeyMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const apiKey = req.headers['x-api-key'] || req.query.api_key;

    if (!apiKey || typeof apiKey !== 'string') {
        return res.status(401).json({ error: 'API key is required' });
    }

    try {
        const result = await ApiKeyService.validateKey(apiKey);

        if (!result) {
            return res.status(401).json({ error: 'Invalid or expired API key' });
        }

        // Attach user and scopes to request
        (req as any).user = result.user;
        (req as any).apiScopes = result.scopes;

        next();
    } catch (error) {
        console.error('API Key validation error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * Helper to check if the current API key has a specific scope
 */
export const hasScope = (scope: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const scopes = (req as any).apiScopes as string[];

        if (!scopes || (!scopes.includes(scope) && !scopes.includes('admin'))) {
            return res.status(403).json({ error: `Missing required scope: ${scope}` });
        }

        next();
    };
};
