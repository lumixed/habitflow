import { Router, Request, Response } from 'express';
import prisma from '../config/prisma';

const router = Router();

/**
 * POST /api/partners/inquiry
 * Capture a new partnership lead
 */
router.post('/inquiry', async (req: Request, res: Response) => {
    try {
        const { company_name, contact_name, email, phone, type, size, message } = req.body;

        if (!company_name || !contact_name || !email || !type) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const inquiry = await prisma.partnerInquiry.create({
            data: {
                company_name,
                contact_name,
                email,
                phone,
                type,
                size,
                message
            }
        });

        res.status(201).json({ message: 'Inquiry received successfully!', id: inquiry.id });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
