import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { ApiKeyService } from '../services/apiKeyService';
import { WebhookService } from '../services/webhookService';

const router = Router();

// All developer routes require JWT authentication
router.use(authenticate);

/**
 * API KEYS
 */

router.get('/keys', async (req: any, res) => {
    try {
        const keys = await ApiKeyService.listKeys(req.user.id);
        res.json(keys);
    } catch (error) {
        res.status(500).json({ error: 'Failed to list API keys' });
    }
});

router.post('/keys', async (req: any, res) => {
    try {
        const { name, scopes } = req.body;
        const { rawKey, apiKey } = await ApiKeyService.generateKey(req.user.id, name, scopes);
        res.json({ rawKey, apiKey });
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate API key' });
    }
});

router.delete('/keys/:id', async (req: any, res) => {
    try {
        await ApiKeyService.revokeKey(req.params.id, req.user.id);
        res.json({ message: 'API key revoked' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to revoke API key' });
    }
});

/**
 * WEBHOOKS
 */

router.get('/webhooks', async (req: any, res) => {
    try {
        const webhooks = await WebhookService.list(req.user.id);
        res.json(webhooks);
    } catch (error) {
        res.status(500).json({ error: 'Failed to list webhooks' });
    }
});

router.post('/webhooks', async (req: any, res) => {
    try {
        const { url, events } = req.body;
        const webhook = await WebhookService.register(req.user.id, url, events);
        res.json(webhook);
    } catch (error) {
        res.status(500).json({ error: 'Failed to register webhook' });
    }
});

router.delete('/webhooks/:id', async (req: any, res) => {
    try {
        await WebhookService.delete(req.params.id, req.user.id);
        res.json({ message: 'Webhook deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete webhook' });
    }
});

export default router;
