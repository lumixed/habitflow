import { Router, Request, Response, NextFunction } from 'express';
import * as authService from '../services/authService';
import * as exportService from '../services/exportService';
import * as privacyService from '../services/privacyService';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/signup', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password, display_name } = req.body;
        const result = await authService.signup({ email, password, display_name });
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
});

router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;
        const result = await authService.login({ email, password });
        res.json(result);
    } catch (error) {
        next(error);
    }
});

router.get('/me', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const user = await authService.getUserById(req.user.sub);
        res.json({ user });
    } catch (error) {
        next(error);
    }
});

router.post('/profile/update', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const updatedUser = await authService.updateProfile(req.user.sub, req.body);
        res.json({ user: updatedUser });
    } catch (error) {
        next(error);
    }
});

router.post('/2fa/setup', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
        const result = await authService.generate2FASecret(req.user.sub);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

router.post('/2fa/verify', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
        const { token } = req.body;
        const result = await authService.verifyAndEnable2FA(req.user.sub, token);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

router.post('/2fa/disable', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
        const { token } = req.body;
        const result = await authService.disable2FA(req.user.sub, token);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

router.post('/login/2fa', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId, token } = req.body;
        const result = await authService.loginVerify2FA(userId, token);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

router.get('/export-data', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

        const zipStream = await exportService.exportUserData(req.user.sub);

        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename=habitflow-export-${req.user.sub}-${new Date().toISOString().split('T')[0]}.zip`);

        zipStream.pipe(res);
    } catch (error) {
        next(error);
    }
});

router.delete('/account', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

        await privacyService.deleteAccount(req.user.sub);
        res.json({ message: 'Account deleted successfully' });
    } catch (error) {
        next(error);
    }
});

router.post('/privacy-settings', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

        const updatedUser = await privacyService.updatePrivacySettings(req.user.sub, req.body);
        res.json({ user: updatedUser });
    } catch (error) {
        next(error);
    }
});

export default router;
