import Stripe from 'stripe';
import prisma from '../config/prisma';

const stripeKey = process.env.STRIPE_SECRET_KEY;
if (!stripeKey || stripeKey.startsWith('sk_test_placeholder')) {
    console.warn('[stripeService] WARNING: STRIPE_SECRET_KEY is not set or is a placeholder. Billing features will be unavailable.');
}

const stripe = stripeKey && !stripeKey.startsWith('sk_test_placeholder')
    ? new Stripe(stripeKey, { apiVersion: '2023-10-16' as any })
    : null as unknown as Stripe;

export const PLAN_PRICES = {
    PRO: 'price_pro_placeholder',
    TEAM: 'price_team_placeholder',
};

export async function createCheckoutSession(userId: string, plan: 'PRO' | 'TEAM') {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    let stripeCustomerId = user.stripe_customer_id;

    if (!stripeCustomerId) {
        const customer = await stripe.customers.create({
            email: user.email,
            metadata: { userId },
        });
        stripeCustomerId = customer.id;
        await prisma.user.update({
            where: { id: userId },
            data: { stripe_customer_id: stripeCustomerId },
        });
    }

    const session = await stripe.checkout.sessions.create({
        customer: stripeCustomerId,
        payment_method_types: ['card'],
        line_items: [
            {
                price: PLAN_PRICES[plan],
                quantity: 1,
            },
        ],
        mode: 'subscription',
        success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/pricing`,
        metadata: { userId, plan },
    });

    return session;
}

export async function handleWebhook(event: Stripe.Event) {
    const session = event.data.object as any;

    switch (event.type) {
        case 'checkout.session.completed':
            const userId = session.metadata.userId;
            const plan = session.metadata.plan;
            const subscriptionId = session.subscription;

            await prisma.user.update({
                where: { id: userId },
                data: {
                    plan,
                    subscription_id: subscriptionId,
                    subscription_status: 'active',
                },
            });
            break;

        case 'customer.subscription.deleted':
            const customerId = session.customer;
            await prisma.user.updateMany({
                where: { stripe_customer_id: customerId as string },
                data: {
                    plan: 'FREE',
                    subscription_status: 'canceled',
                },
            });
            break;

        case 'customer.subscription.updated':
            const sub = event.data.object as Stripe.Subscription;
            await prisma.user.updateMany({
                where: { subscription_id: sub.id },
                data: {
                    subscription_status: sub.status,
                },
            });
            break;
    }
}
