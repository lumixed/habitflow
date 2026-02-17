import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as stripeService from '../services/stripeService';
import Stripe from 'stripe';

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2023-10-16' as any,
});

router.post('/checkout', authenticate, async (req: any, res, next) => {
    try {
        const { plan } = req.body;
        if (!['PRO', 'TEAM'].includes(plan)) {
            return res.status(400).json({ message: 'Invalid plan' });
        }

        const session = await stripeService.createCheckoutSession(req.user.sub, plan);
        res.json({ url: session.url });
    } catch (error) {
        next(error);
    }
});

router.post('/webhook', async (req, res, next) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            (req as any).rawBody || req.body,
            sig || '',
            process.env.STRIPE_WEBHOOK_SECRET || ''
        );
    } catch (err: any) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
        await stripeService.handleWebhook(event);
        res.json({ received: true });
    } catch (error) {
        next(error);
    }
});

export default router;
